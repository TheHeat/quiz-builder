import React from "react";
import styles from "./LikertScale.module.css";
import { Question, LikertScale as LikertScaleType } from "../lib/types";

type Props = {
	question: Question;
	value: number | null;
	onChange: (v: number) => void;
	quizScale?: LikertScaleType;
	name?: string;
};

export default function LikertScale({
	question,
	value,
	onChange,
	quizScale,
	name,
}: Props) {
	// Prefer question-level scale; fall back to quiz-level scale; finally defaults
	const scale = question.scale ?? quizScale ?? { min: 1, max: 5 };
	const min = scale.min;
	const max = scale.max;
	const labels = scale.labels;

	const options = [] as number[];
	for (let i = min; i <= max; i++) options.push(i);

	return (
		<div className={styles.container}>
			<div
				className={styles.options}
				role="radiogroup"
				aria-label={question.text}
			>
				{options.map((o) => (
					<label
						key={o}
						className={styles.option}
					>
						<input
							type="radio"
							name={name ?? question.id}
							checked={value === o}
							onChange={() => onChange(o)}
							required
						/>
						<div>{labels ? labels[o - min] ?? o : o}</div>
					</label>
				))}
			</div>
		</div>
	);
}
