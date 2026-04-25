import { useEffect, useMemo, useState } from "react";
import {
	assignModuleToUser,
	createAdminLesson,
	createAdminModule,
	deleteAdminLesson,
	deleteAdminModule,
	getAdminModules,
	getAdminUsers,
	unassignModuleFromUser,
	updateAdminModule,
} from "@/lib/authApi";
import { useAuth } from "@/lib/AuthContext";

const CATEGORY_OPTIONS = ["alphabet", "vocabulary", "sentences", "conversation"];
const ROLE_CATEGORY_OPTIONS = ["learner", "support-circle", "accessibility-needs"];

const EMPTY_MODULE_FORM = {
	title: "",
	description: "",
	icon: "BookText",
	category: "alphabet",
	orderIndex: 1,
	isSequential: false,
	roleCategories: ["learner"],
	isActive: true,
};

const EMPTY_LESSON_FORM = {
	title: "",
	description: "",
	contentUrl: "",
	duration: 5,
	order: 1,
	difficultyLevel: "beginner",
};

function RoleCategoryCheckboxes({ value, onChange }) {
	return (
		<div className="flex flex-wrap gap-2">
			{ROLE_CATEGORY_OPTIONS.map((item) => {
				const checked = value.includes(item);
				return (
					<label key={item} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
						<input
							type="checkbox"
							checked={checked}
							onChange={(event) => {
								if (event.target.checked) {
									onChange([...value, item]);
									return;
								}

								onChange(value.filter((entry) => entry !== item));
							}}
						/>
						<span>{item}</span>
					</label>
				);
			})}
		</div>
	);
}

function ModuleCard({ moduleItem, users, onModuleUpdated, onModuleDeleted, onRefresh }) {
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState("");
	const [selectedUserId, setSelectedUserId] = useState("");
	const [moduleForm, setModuleForm] = useState({
		title: moduleItem.title,
		description: moduleItem.description,
		icon: moduleItem.icon,
		category: moduleItem.category,
		orderIndex: moduleItem.orderIndex,
		isSequential: moduleItem.isSequential,
		isActive: moduleItem.isActive,
		roleCategories: moduleItem.roleCategories || [],
	});
	const [lessonForm, setLessonForm] = useState(EMPTY_LESSON_FORM);

	const assignedUsers = moduleItem.assignedUsers || [];
	const availableUsers = users.filter((entry) => !assignedUsers.some((assigned) => assigned.id === entry.id));

	async function handleSaveModule() {
		setError("");
		setSaved("");
		setIsSaving(true);
		try {
			const payload = {
				...moduleForm,
				orderIndex: Number(moduleForm.orderIndex),
			};
			const response = await updateAdminModule(moduleItem._id, payload);
			onModuleUpdated(response.data);
			setSaved("Module updated.");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to update module.");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDeleteModule() {
		const confirmed = window.confirm("Delete module and all its lessons?");
		if (!confirmed) {
			return;
		}

		setError("");
		setSaved("");
		setIsSaving(true);
		try {
			await deleteAdminModule(moduleItem._id);
			onModuleDeleted(moduleItem._id);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to delete module.");
			setIsSaving(false);
		}
	}

	async function handleAddLesson(event) {
		event.preventDefault();
		setError("");
		setSaved("");
		setIsSaving(true);
		try {
			await createAdminLesson(moduleItem._id, {
				...lessonForm,
				duration: Number(lessonForm.duration),
				order: Number(lessonForm.order),
			});
			setLessonForm({ ...EMPTY_LESSON_FORM, order: Number(lessonForm.order) + 1 });
			setSaved("Lesson added.");
			onModuleUpdated(null);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to add lesson.");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDeleteLesson(lessonId) {
		const confirmed = window.confirm("Delete this lesson?");
		if (!confirmed) {
			return;
		}

		setError("");
		setSaved("");
		setIsSaving(true);
		try {
			await deleteAdminLesson(lessonId);
			onModuleUpdated(null);
			setSaved("Lesson deleted.");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to delete lesson.");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleAssignUser(event) {
		event.preventDefault();
		if (!selectedUserId) {
			return;
		}

		setError("");
		setSaved("");
		setIsSaving(true);
		try {
			await assignModuleToUser(moduleItem._id, selectedUserId);
			setSelectedUserId("");
			setSaved("User assigned to module.");
			onRefresh();
		} catch (err) {
			setError(err.response?.data?.message || "Failed to assign user.");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleUnassignUser(userId) {
		setError("");
		setSaved("");
		setIsSaving(true);
		try {
			await unassignModuleFromUser(moduleItem._id, userId);
			setSaved("User unassigned from module.");
			onRefresh();
		} catch (err) {
			setError(err.response?.data?.message || "Failed to remove assignment.");
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<article className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-soft">
			<div className="grid gap-3 md:grid-cols-2">
				<label className="text-sm font-semibold text-slate-700">
					Title
					<input
						value={moduleForm.title}
						onChange={(event) => setModuleForm((current) => ({ ...current, title: event.target.value }))}
						className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
					/>
				</label>
				<label className="text-sm font-semibold text-slate-700">
					Icon
					<input
						value={moduleForm.icon}
						onChange={(event) => setModuleForm((current) => ({ ...current, icon: event.target.value }))}
						className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
					/>
				</label>
			</div>

			<label className="mt-3 block text-sm font-semibold text-slate-700">
				Description
				<textarea
					value={moduleForm.description}
					onChange={(event) => setModuleForm((current) => ({ ...current, description: event.target.value }))}
					className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
				/>
			</label>

			<div className="mt-3 grid gap-3 md:grid-cols-4">
				<label className="text-sm font-semibold text-slate-700">
					Category
					<select
						value={moduleForm.category}
						onChange={(event) => setModuleForm((current) => ({ ...current, category: event.target.value }))}
						className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
					>
						{CATEGORY_OPTIONS.map((item) => (
							<option key={item} value={item}>{item}</option>
						))}
					</select>
				</label>
				<label className="text-sm font-semibold text-slate-700">
					Order
					<input
						type="number"
						value={moduleForm.orderIndex}
						onChange={(event) => setModuleForm((current) => ({ ...current, orderIndex: event.target.value }))}
						className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
					/>
				</label>
				<label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
					<input
						type="checkbox"
						checked={moduleForm.isSequential}
						onChange={(event) => setModuleForm((current) => ({ ...current, isSequential: event.target.checked }))}
					/>
					Sequential
				</label>
				<label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
					<input
						type="checkbox"
						checked={moduleForm.isActive}
						onChange={(event) => setModuleForm((current) => ({ ...current, isActive: event.target.checked }))}
					/>
					Active
				</label>
			</div>

			<div className="mt-3">
				<p className="text-sm font-semibold text-slate-700">Visible to role categories</p>
				<div className="mt-2">
					<RoleCategoryCheckboxes
						value={moduleForm.roleCategories}
						onChange={(nextValue) => setModuleForm((current) => ({ ...current, roleCategories: nextValue }))}
					/>
				</div>
			</div>

			<div className="mt-4 flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={handleSaveModule}
					disabled={isSaving}
					className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
				>
					Save Module
				</button>
				<button
					type="button"
					onClick={handleDeleteModule}
					disabled={isSaving}
					className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700"
				>
					Delete Module
				</button>
				{saved ? <span className="text-xs font-semibold text-emerald-700">{saved}</span> : null}
				{error ? <span className="text-xs font-semibold text-rose-700">{error}</span> : null}
			</div>

			<section className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
				<h3 className="text-sm font-bold text-slate-900">Assigned Users</h3>
				<ul className="mt-2 space-y-2">
					{assignedUsers.length === 0 ? (
						<li className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500">
							No users assigned directly yet.
						</li>
					) : null}
					{assignedUsers.map((assignedUser) => (
						<li key={assignedUser.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
							<span>
								{assignedUser.fullName} ({assignedUser.email})
							</span>
							<button
								type="button"
								onClick={() => handleUnassignUser(assignedUser.id)}
								className="rounded-lg border border-red-200 px-2 py-1 font-semibold text-red-600"
							>
								Remove
							</button>
						</li>
					))}
				</ul>

				<form onSubmit={handleAssignUser} className="mt-3 flex flex-wrap items-center gap-2">
					<select
						value={selectedUserId}
						onChange={(event) => setSelectedUserId(event.target.value)}
						className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
					>
						<option value="">Assign user...</option>
						{availableUsers.map((entry) => (
							<option key={entry.id} value={entry.id}>
								{entry.fullName} ({entry.email})
							</option>
						))}
					</select>
					<button type="submit" className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white">
						Assign User
					</button>
				</form>
			</section>

			<section className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
				<h3 className="text-sm font-bold text-slate-900">Lessons</h3>
				<ul className="mt-2 space-y-2">
					{(moduleItem.lessons || []).map((lesson) => (
						<li key={lesson._id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
							<span>
								#{lesson.order} {lesson.title} • {lesson.duration} min
							</span>
							<button
								type="button"
								onClick={() => handleDeleteLesson(lesson._id)}
								className="rounded-lg border border-red-200 px-2 py-1 font-semibold text-red-600"
							>
								Delete
							</button>
						</li>
					))}
				</ul>

				<form onSubmit={handleAddLesson} className="mt-3 grid gap-2 md:grid-cols-5">
					<input
						required
						value={lessonForm.title}
						onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))}
						placeholder="Lesson title"
						className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
					/>
					<input
						type="number"
						value={lessonForm.order}
						onChange={(event) => setLessonForm((current) => ({ ...current, order: event.target.value }))}
						placeholder="Order"
						className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
					/>
					<input
						type="number"
						value={lessonForm.duration}
						onChange={(event) => setLessonForm((current) => ({ ...current, duration: event.target.value }))}
						placeholder="Minutes"
						className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
					/>
					<input
						value={lessonForm.description}
						onChange={(event) => setLessonForm((current) => ({ ...current, description: event.target.value }))}
						placeholder="Description"
						className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
					/>
					<button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
						Add Lesson
					</button>
				</form>
			</section>
		</article>
	);
}

function AdminModulesPage() {
	const { user } = useAuth();
	const roleValue = String(user?.role || "").toLowerCase();
	const isAdmin = roleValue === "admin";
	const [modules, setModules] = useState([]);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [moduleForm, setModuleForm] = useState(EMPTY_MODULE_FORM);
	const [savingModule, setSavingModule] = useState(false);

	async function loadModules() {
		setLoading(true);
		setError("");
		try {
			const response = await getAdminModules();
			setModules(response.data || []);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to load modules.");
		} finally {
			setLoading(false);
		}
	}

	async function loadUsers() {
		try {
			const response = await getAdminUsers();
			setUsers(response.data || []);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to load users.");
		}
	}

	useEffect(() => {
		if (isAdmin) {
			loadModules();
			loadUsers();
		}
	}, [isAdmin]);

	const sortedModules = useMemo(() => {
		return [...modules].sort((left, right) => left.orderIndex - right.orderIndex);
	}, [modules]);

	function upsertModule(nextModule) {
		if (!nextModule) {
			loadModules();
			return;
		}

		setModules((current) => {
			const exists = current.some((item) => item._id === nextModule._id);
			if (exists) {
				return current.map((item) => (item._id === nextModule._id ? { ...item, ...nextModule } : item));
			}
			return [...current, nextModule];
		});
	}

	function removeModule(moduleId) {
		setModules((current) => current.filter((item) => item._id !== moduleId));
	}

	async function handleCreateModule(event) {
		event.preventDefault();
		setError("");
		setSavingModule(true);
		try {
			const response = await createAdminModule({
				...moduleForm,
				orderIndex: Number(moduleForm.orderIndex),
			});
			upsertModule(response.data);
			setModuleForm({ ...EMPTY_MODULE_FORM, orderIndex: Number(moduleForm.orderIndex) + 1 });
		} catch (err) {
			setError(err.response?.data?.message || "Failed to create module.");
		} finally {
			setSavingModule(false);
		}
	}

	if (!isAdmin) {
		return (
			<div className="pt-24 px-6 pb-16">
				<div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
					<h1 className="text-2xl font-bold text-rose-700">Admin Access Required</h1>
					<p className="mt-2 text-sm font-medium text-rose-700">
						Only admin/teacher accounts can manage learning modules.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-24 px-6 pb-12">
			<div className="mx-auto max-w-6xl space-y-6">
				<div>
					<p className="text-xs font-semibold tracking-[0.2em] text-indigo-700 uppercase">Admin Panel</p>
					<h1 className="mt-2 text-3xl font-bold text-slate-900">Manage Learning Modules</h1>
					<p className="mt-2 text-sm text-slate-600">Create modules, set audience roles, and add lessons for sign language learning tracks.</p>
				</div>

				<form onSubmit={handleCreateModule} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-soft">
					<h2 className="text-lg font-bold text-slate-900">Create New Module</h2>
					<div className="mt-3 grid gap-3 md:grid-cols-2">
						<input
							required
							value={moduleForm.title}
							onChange={(event) => setModuleForm((current) => ({ ...current, title: event.target.value }))}
							placeholder="Module title"
							className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
						/>
						<input
							required
							value={moduleForm.icon}
							onChange={(event) => setModuleForm((current) => ({ ...current, icon: event.target.value }))}
							placeholder="Icon (e.g., BookText)"
							className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
						/>
					</div>
					<textarea
						required
						value={moduleForm.description}
						onChange={(event) => setModuleForm((current) => ({ ...current, description: event.target.value }))}
						placeholder="Module description"
						className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
					/>
					<div className="mt-3 grid gap-3 md:grid-cols-4">
						<select
							value={moduleForm.category}
							onChange={(event) => setModuleForm((current) => ({ ...current, category: event.target.value }))}
							className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
						>
							{CATEGORY_OPTIONS.map((item) => (
								<option key={item} value={item}>{item}</option>
							))}
						</select>
						<input
							type="number"
							value={moduleForm.orderIndex}
							onChange={(event) => setModuleForm((current) => ({ ...current, orderIndex: event.target.value }))}
							placeholder="Order"
							className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
						/>
						<label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
							<input
								type="checkbox"
								checked={moduleForm.isSequential}
								onChange={(event) => setModuleForm((current) => ({ ...current, isSequential: event.target.checked }))}
							/>
							Sequential
						</label>
						<label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
							<input
								type="checkbox"
								checked={moduleForm.isActive}
								onChange={(event) => setModuleForm((current) => ({ ...current, isActive: event.target.checked }))}
							/>
							Active
						</label>
					</div>
					<div className="mt-3">
						<RoleCategoryCheckboxes
							value={moduleForm.roleCategories}
							onChange={(nextValue) => setModuleForm((current) => ({ ...current, roleCategories: nextValue }))}
						/>
					</div>
					<div className="mt-4 flex items-center gap-3">
						<button
							type="submit"
							disabled={savingModule}
							className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white"
						>
							{savingModule ? "Creating..." : "Create Module"}
						</button>
						{error ? <span className="text-xs font-semibold text-rose-700">{error}</span> : null}
					</div>
				</form>

				{loading ? <p className="text-sm text-slate-600">Loading modules...</p> : null}
				<div className="space-y-4">
					{sortedModules.map((moduleItem) => (
						<ModuleCard
							key={moduleItem._id}
							moduleItem={moduleItem}
							users={users}
							onModuleUpdated={upsertModule}
							onModuleDeleted={removeModule}
							onRefresh={loadModules}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default AdminModulesPage;