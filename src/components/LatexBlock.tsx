import katex from "katex";
import "katex/dist/katex.min.css"; // Import KaTeX CSS

interface Props {
	math: string;
}

export default function LatexBlock({ math }: Props) {
	const html = katex.renderToString(math, {
		throwOnError: false,
		displayMode: true,
	});

	return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
