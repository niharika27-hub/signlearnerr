import { getOptionImage, getOptionText, getOptionAlt, getOptionDisplayType } from "@/lib/quizUtils";

/**
 * QuizOptionRenderer Component
 * Renders quiz options as either image grid or text buttons based on option type
 *
 * @param {Array} options - Array of option objects or strings
 * @param {number} selectedIndex - Currently selected option index
 * @param {Function} onSelect - Callback when option is selected
 * @param {boolean} disabled - Whether options are disabled (during submission/review)
 */
function QuizOptionRenderer({ options = [], selectedIndex = -1, onSelect = () => {}, disabled = false }) {
	const displayType = getOptionDisplayType(options);

	if (displayType === "image-grid") {
		return <ImageOptionGrid options={options} selectedIndex={selectedIndex} onSelect={onSelect} disabled={disabled} />;
	}

	return <TextOptionButtons options={options} selectedIndex={selectedIndex} onSelect={onSelect} disabled={disabled} />;
}

/**
 * Text-based option buttons (traditional quiz style)
 */
function TextOptionButtons({ options, selectedIndex, onSelect, disabled }) {
	return (
		<div className="mt-4 grid gap-2">
			{options.map((option, optionIndex) => {
				const isActive = selectedIndex === optionIndex;
				const optionText = getOptionText(option);

				return (
					<button
						key={`text-option-${optionIndex}`}
						type="button"
						onClick={() => !disabled && onSelect(optionIndex)}
						disabled={disabled}
						className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
							isActive
								? "border-indigo-300 bg-indigo-50 text-indigo-900"
								: "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
						}`}
					>
						{optionText}
					</button>
				);
			})}
		</div>
	);
}

/**
 * Image-based option grid (for alphabet images, etc.)
 */
function ImageOptionGrid({ options, selectedIndex, onSelect, disabled }) {
	return (
		<div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
			{options.map((option, optionIndex) => {
				const isActive = selectedIndex === optionIndex;
				const imageUrl = getOptionImage(option);
				const altText = getOptionAlt(option);
				const optionText = getOptionText(option);

				if (!imageUrl) {
					// Fallback if image is missing
					return (
						<button
							key={`image-option-${optionIndex}`}
							type="button"
							onClick={() => !disabled && onSelect(optionIndex)}
							disabled={disabled}
							className={`rounded-xl border-2 px-3 py-2 text-center text-sm font-medium transition ${
								isActive
									? "border-indigo-400 bg-indigo-50 text-indigo-900"
									: "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
							}`}
						>
							{optionText || `Option ${optionIndex + 1}`}
						</button>
					);
				}

				return (
					<button
						key={`image-option-${optionIndex}`}
						type="button"
						onClick={() => !disabled && onSelect(optionIndex)}
						disabled={disabled}
						className={`relative rounded-xl border-2 overflow-hidden transition ${
							isActive
								? "border-indigo-400 ring-2 ring-indigo-300 shadow-lg"
								: "border-slate-200 hover:border-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
						}`}
					>
						<img
							src={imageUrl}
							alt={altText}
							className="h-20 w-full object-contain bg-white sm:h-24"
							loading="lazy"
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
						/>
						{optionText && <p className="mt-2 text-xs font-semibold text-slate-700 text-center px-2 pb-2">{optionText}</p>}
						{isActive && (
							<div className="absolute inset-0 flex items-center justify-center bg-indigo-500/20 backdrop-blur-sm">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white">
									<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
								</div>
							</div>
						)}
					</button>
				);
			})}
		</div>
	);
}

export default QuizOptionRenderer;
