import React from "react";
import styles from "./LikertScale.module.css";
import { Question } from "../lib/types";

type Props = {
	question: Question;
	value: number | null;
	onChange: (v: number) => void;
};

export default function LikertScale({ question, value, onChange }: Props) {
	const min = question.scale?.min ?? 1;
	const max = question.scale?.max ?? 5;
	const labels = question.scale?.labels;

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
							name={question.id}
							checked={value === o}
							onChange={() => onChange(o)}
						/>
						<div>{o}</div>
					</label>
				))}
			</div>
			{labels ? (
				<div className={styles.labels}>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<span>{labels[0]}</span>
						<span>{labels[labels.length - 1]}</span>
					</div>
				</div>
			) : null}
		</div>
	);
}
