import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { loadVolitionalSheetResponses } from "../lib/persist";
import VolitionalSheetResults from "../components/VolitionalSheetResults";

import { useSheetContext } from "../context/SheetContext";

const VolitionalSheetPage = () => {
	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();
	const {
		sheet,
		setSheet,
		loading,
		setLoading,
		currentScenarioIndex,
		responses,
		setResponses,
	} = useSheetContext();

	// Load sheet data and existing responses
	useEffect(() => {
		const loadSheet = async () => {
			if (!slug) return;
			try {
				const modules = import.meta.glob(
					"/data/volitional-sheets/*/sheet.json",
					{
						query: "?json",
					}
				) as Record<string, () => Promise<any>>;

				for (const [path, loader] of Object.entries(modules)) {
					const parts = path.split("/");
					const slugFromPath = parts[3];
					if (slugFromPath === slug) {
						const data = await loader();
						setSheet(data);

						// Load any existing responses
						const saved = loadVolitionalSheetResponses(slug);
						setResponses(saved.length > 0 ? saved : []);
						setLoading(false);
						return;
					}
				}
			} catch (e) {
				console.error("Failed to load sheet", e);
			}
			setLoading(false);
		};

		loadSheet();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slug]);

	const handleHome = () => {
		navigate("/");
	};

	return (
		<div className="wrapper">
			<Link to="/">← Back</Link>
			<h1>{sheet?.title}</h1>
			<VolitionalSheetResults
				categories={sheet?.categories || []}
				responses={responses}
			/>
			<button
				onClick={handleHome}
				style={{ marginTop: 16 }}
			>
				Back to Home
			</button>
		</div>
	);
};

export default VolitionalSheetPage;
