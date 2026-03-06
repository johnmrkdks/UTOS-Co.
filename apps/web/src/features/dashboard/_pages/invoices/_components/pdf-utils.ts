import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export function sanitizeFilename(name: string): string {
	return name.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
}

export async function elementToPdfBlob(el: HTMLElement): Promise<Blob> {
	const canvas = await html2canvas(el, {
		scale: 2,
		useCORS: true,
		logging: false,
	});
	const imgData = canvas.toDataURL("image/jpeg", 0.98);
	const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	const margin = 10;
	const contentWidth = pageWidth - margin * 2;
	const contentHeight = pageHeight - margin * 2;
	const imgProps = pdf.getImageProperties(imgData);
	const imgWidth = imgProps.width;
	const imgHeight = imgProps.height;
	const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
	const scaledWidth = imgWidth * ratio;
	const scaledHeight = imgHeight * ratio;
	pdf.addImage(imgData, "JPEG", margin, margin, scaledWidth, scaledHeight);
	return pdf.output("blob");
}
