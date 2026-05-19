import { useEffect, useMemo, useState } from "react";
import {
	createQuizQuestion,
	deleteQuizQuestion,
	getQuizCloudinaryImages,
	getQuizQuestionsForLesson,
	getApiErrorMessage,
} from "@/lib/authApi";

const QUESTION_TYPES = [
	{ value: "alphabet-recognition", label: "Alphabet recognition" },
	{ value: "handshape-to-letter", label: "Handshape to letter" },
	{ value: "text-based", label: "Text based" },
	{ value: "image-to-text", label: "Image to text" },
];

const DEFAULT_OPTION_COUNT = 4;

function createEmptyOption(index) {
	return {
		text: "",
		image: "",
		imageAlt: "",
		isCorrect: index === 0,
	};
}

function createEmptyForm() {
	return {
		questionType: "alphabet-recognition",
		questionText: "",
		questionImage: "",
		questionImageAlt: "",
		difficulty: "easy",
		order: 1,
		tags: "",
		explanation: "",
		options: Array.from({ length: DEFAULT_OPTION_COUNT }, (_, index) => createEmptyOption(index)),
	};
}

function formatQuestionType(value) {
	return QUESTION_TYPES.find((item) => item.value === value)?.label || value;
}

function buildQuestionPayload(form, lessonId, moduleId) {
	return {
		lessonId,
		moduleId,
		questionType: form.questionType,
		questionText: form.questionText.trim(),
		questionImage: form.questionImage.trim() || null,
		questionImageAlt: form.questionImageAlt.trim(),
		difficulty: form.difficulty,
		order: Number(form.order) || 0,
		tags: String(form.tags || "")
			.split(",")
			.map((entry) => entry.trim())
			.filter(Boolean),
		explanation: form.explanation.trim(),
		options: form.options.map((option) => ({
			text: option.text.trim(),
			image: option.image.trim() || null,
			imageAlt: option.imageAlt.trim(),
			isCorrect: Boolean(option.isCorrect),
		})),
	};
}

const DEFAULT_CLOUDINARY_FOLDER = "signlearnerr/alphabets";

function ImageField({ label, value, placeholder, onChange, onBrowse }) {
	return (
		<label className="text-xs font-semibold text-slate-700">
			{label}
			<div className="mt-1 flex gap-2">
				<input
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
				/>
				<button
					type="button"
					onClick={onBrowse}
					className="shrink-0 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800"
				>
					Browse
				</button>
			</div>
		</label>
	);
}

function QuestionOptionEditor({ option, index, groupName, onChange, onBrowseImage }) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Option {index + 1}</p>
				<label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
					<input
						type="radio"
						name={groupName}
						checked={option.isCorrect}
						onChange={() => onChange({ ...option, isCorrect: true })}
					/>
					Correct
				</label>
			</div>

			<div className="mt-2 grid gap-2">
				<input
					value={option.text}
					onChange={(event) => onChange({ ...option, text: event.target.value })}
					placeholder="Option text"
					className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
				/>
				<div className="flex gap-2">
					<input
						value={option.image}
						onChange={(event) => onChange({ ...option, image: event.target.value })}
						placeholder="Cloudinary image URL"
						className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
					/>
					<button
						type="button"
						onClick={onBrowseImage}
						className="shrink-0 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800"
					>
						Browse
					</button>
				</div>
				<input
					value={option.imageAlt}
					onChange={(event) => onChange({ ...option, imageAlt: event.target.value })}
					placeholder="Image alt text"
					className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
				/>
			</div>
		</div>
	);
}

function QuizQuestionManager({ lessonId, moduleId, lessonTitle = "" }) {
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState("");
	const [pickerOpen, setPickerOpen] = useState(false);
	const [pickerTarget, setPickerTarget] = useState(null);
	const [pickerFolder, setPickerFolder] = useState(DEFAULT_CLOUDINARY_FOLDER);
	const [pickerLoading, setPickerLoading] = useState(false);
	const [pickerError, setPickerError] = useState("");
	const [pickerImages, setPickerImages] = useState([]);
	const [form, setForm] = useState(() => createEmptyForm());

	const questionCount = useMemo(() => questions.length, [questions]);

	async function loadQuestions() {
		if (!lessonId) {
			setQuestions([]);
			return;
		}

		setLoading(true);
		setError("");
		try {
			const response = await getQuizQuestionsForLesson(lessonId);
			setQuestions(Array.isArray(response?.data) ? response.data : []);
		} catch (err) {
			setError(getApiErrorMessage(err, "Failed to load quiz questions."));
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadQuestions();
		setForm(createEmptyForm());
	}, [lessonId]);

	async function handleCreateQuestion(event) {
		event.preventDefault();
		setError("");
		setSaved("");
		setSaving(true);

		try {
			const payload = buildQuestionPayload(form, lessonId, moduleId);
			const hasCorrectOption = payload.options.some((option) => option.isCorrect);
			if (!hasCorrectOption) {
				throw new Error("Select at least one correct option.");
			}

			if (!payload.questionText) {
				throw new Error("Question text is required.");
			}

			if (payload.options.filter((option) => option.text || option.image).length < 2) {
				throw new Error("Add at least two options.");
			}

			await createQuizQuestion(payload);
			setSaved("Quiz question created.");
			setForm(createEmptyForm());
			await loadQuestions();
		} catch (err) {
			setError(err.message || getApiErrorMessage(err, "Failed to create quiz question."));
		} finally {
			setSaving(false);
		}
	}

	async function handleDeleteQuestion(questionId) {
		const confirmed = window.confirm("Delete this quiz question?");
		if (!confirmed) {
			return;
		}

		setError("");
		setSaved("");
		try {
			await deleteQuizQuestion(questionId);
			setSaved("Quiz question deleted.");
			await loadQuestions();
		} catch (err) {
			setError(getApiErrorMessage(err, "Failed to delete quiz question."));
		}
	}

	async function loadCloudinaryImages(folder = pickerFolder) {
		setPickerLoading(true);
		setPickerError("");
		try {
			const response = await getQuizCloudinaryImages({ folder, limit: 60 });
			setPickerImages(Array.isArray(response?.data?.images) ? response.data.images : []);
		} catch (err) {
			setPickerError(getApiErrorMessage(err, "Failed to load Cloudinary images."));
			setPickerImages([]);
		} finally {
			setPickerLoading(false);
		}
	}

	function openPicker(target) {
		setPickerTarget(target);
		setPickerOpen(true);
		loadCloudinaryImages(pickerFolder);
	}

	function closePicker() {
		setPickerOpen(false);
		setPickerTarget(null);
		setPickerError("");
	}

	function applyPickedImage(imageUrl) {
		if (!pickerTarget || !imageUrl) {
			return;
		}

		if (pickerTarget.type === "questionImage") {
			setForm((current) => ({ ...current, questionImage: imageUrl }));
		} else if (pickerTarget.type === "optionImage") {
			setForm((current) => ({
				...current,
				options: current.options.map((option, index) => (index === pickerTarget.index ? { ...option, image: imageUrl } : option)),
			}));
		}

		closePicker();
	}

	return (
		<section className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Quiz Questions</p>
					<h4 className="mt-1 text-sm font-bold text-slate-900">{lessonTitle || "Lesson"}</h4>
				</div>
				<span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
					{questionCount} question{questionCount === 1 ? "" : "s"}
				</span>
			</div>

			{loading ? <p className="mt-3 text-xs font-semibold text-slate-600">Loading quiz questions...</p> : null}
			{error ? <p className="mt-3 text-xs font-semibold text-rose-700">{error}</p> : null}
			{saved ? <p className="mt-3 text-xs font-semibold text-emerald-700">{saved}</p> : null}

			{questions.length > 0 ? (
				<div className="mt-3 space-y-2">
					{questions.map((question) => (
						<div key={question._id} className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div>
									<p className="font-semibold text-slate-900">{question.questionText}</p>
									<p className="mt-1 text-slate-500">{formatQuestionType(question.questionType)} • {question.difficulty}</p>
								</div>
								<button
									type="button"
									onClick={() => handleDeleteQuestion(question._id)}
									className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 font-semibold text-rose-700"
								>
									Delete
								</button>
							</div>
							{question.questionImage ? (
								<img src={question.questionImage} alt={question.questionImageAlt || question.questionText} className="mt-2 h-20 w-20 rounded-lg object-cover" />
							) : null}
						</div>
					))}
				</div>
			) : null}

			<form onSubmit={handleCreateQuestion} className="mt-4 space-y-3 rounded-2xl border border-dashed border-cyan-200 bg-white p-4">
				<div className="grid gap-3 md:grid-cols-2">
					<label className="text-xs font-semibold text-slate-700">
						Question Type
						<select
							value={form.questionType}
							onChange={(event) => setForm((current) => ({ ...current, questionType: event.target.value }))}
							className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
						>
							{QUESTION_TYPES.map((type) => (
								<option key={type.value} value={type.value}>{type.label}</option>
							))}
						</select>
					</label>
					<label className="text-xs font-semibold text-slate-700">
						Difficulty
						<select
							value={form.difficulty}
							onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value }))}
							className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
						>
							<option value="easy">easy</option>
							<option value="medium">medium</option>
							<option value="hard">hard</option>
						</select>
					</label>
				</div>

				<label className="block text-xs font-semibold text-slate-700">
					Question Text
					<textarea
						value={form.questionText}
						onChange={(event) => setForm((current) => ({ ...current, questionText: event.target.value }))}
						className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
						placeholder="Which handshape shows letter A?"
					/>
				</label>

				<div className="grid gap-3 md:grid-cols-2">
					<div className="text-xs font-semibold text-slate-700">
						Question Image URL
						<div className="mt-1">
							<ImageField
								label=""
								value={form.questionImage}
								placeholder="https://res.cloudinary.com/..."
								onChange={(event) => setForm((current) => ({ ...current, questionImage: event.target.value }))}
								onBrowse={() => openPicker({ type: "questionImage" })}
							/>
						</div>
					</div>
					<label className="text-xs font-semibold text-slate-700">
						Question Image Alt Text
						<input
							value={form.questionImageAlt}
							onChange={(event) => setForm((current) => ({ ...current, questionImageAlt: event.target.value }))}
							className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
							placeholder="Letter A handshape"
						/>
					</label>
				</div>

				{pickerOpen ? (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
						<div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
							<div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Cloudinary Image Picker</p>
									<p className="text-sm font-bold text-slate-900">
										Pick an image for {pickerTarget?.type === "questionImage" ? "the question" : `option ${Number(pickerTarget?.index ?? 0) + 1}`}
									</p>
								</div>
								<button type="button" onClick={closePicker} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
									Close
								</button>
							</div>

							<div className="grid gap-3 border-b border-slate-200 px-4 py-3 md:grid-cols-[1fr_auto] md:items-end">
								<label className="block text-xs font-semibold text-slate-700">
									Cloudinary folder
									<input
										value={pickerFolder}
										onChange={(event) => setPickerFolder(event.target.value)}
										className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
										placeholder="signlearnerr/alphabets"
									/>
								</label>
								<button
									type="button"
									onClick={() => loadCloudinaryImages(pickerFolder)}
									disabled={pickerLoading}
									className="rounded-xl bg-cyan-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
								>
									{pickerLoading ? "Loading..." : "Load images"}
								</button>
							</div>

							<div className="max-h-[65vh] overflow-y-auto px-4 py-4">
								{pickerError ? <p className="mb-3 text-xs font-semibold text-rose-700">{pickerError}</p> : null}
								{pickerImages.length > 0 ? (
									<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
										{pickerImages.map((image) => (
											<button key={image.publicId} type="button" onClick={() => applyPickedImage(image.secureUrl)} className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:border-cyan-300 hover:shadow-md">
												<img src={image.secureUrl} alt={image.originalFilename || image.publicId} className="h-36 w-full object-cover" loading="lazy" />
												<div className="p-3">
													<p className="truncate text-xs font-semibold text-slate-900">{image.originalFilename || image.publicId}</p>
													<p className="mt-1 text-[11px] text-slate-500">{image.width} x {image.height}</p>
												</div>
											</button>
										))}
									</div>
								) : pickerLoading ? (
									<p className="text-sm text-slate-600">Loading images from Cloudinary...</p>
								) : (
									<p className="text-sm text-slate-600">No images found in this folder.</p>
								)}
							</div>
						</div>
					</div>
				) : null}

				<label className="block text-xs font-semibold text-slate-700">
					Order
					<input
						type="number"
						value={form.order}
						onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
						className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
					/>
				</label>

				<label className="block text-xs font-semibold text-slate-700">
					Tags (comma separated)
					<input
						value={form.tags}
						onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
						className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
						placeholder="alphabets, beginner"
					/>
				</label>

				<label className="block text-xs font-semibold text-slate-700">
					Explanation
					<textarea
						value={form.explanation}
						onChange={(event) => setForm((current) => ({ ...current, explanation: event.target.value }))}
						className="mt-1 min-h-16 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
						placeholder="Letter A uses a closed fist handshape."
					/>
				</label>

				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
					{form.options.map((option, index) => (
						<QuestionOptionEditor
							key={index}
							index={index}
							groupName={`correct-option-${lessonId || moduleId}`}
							option={option}
							onBrowseImage={() => openPicker({ type: "optionImage", index })}
							onChange={(nextOption) => {
								setForm((current) => ({
									...current,
									options: current.options.map((currentOption, currentIndex) => {
										if (currentIndex === index) {
											return nextOption;
										}
										return { ...currentOption, isCorrect: nextOption.isCorrect ? false : currentOption.isCorrect };
									}),
								}));
							}}
						/>
					))}
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<button type="submit" disabled={saving} className="rounded-xl bg-cyan-700 px-4 py-2 text-xs font-semibold text-white">
						{saving ? "Saving..." : "Add Quiz Question"}
					</button>
					<button
						type="button"
						onClick={() => setForm(createEmptyForm())}
						className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
					>
						Reset
					</button>
				</div>
			</form>
		</section>
	);
}

export default QuizQuestionManager;
