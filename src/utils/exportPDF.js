import { jsPDF } from 'jspdf'

const W = 176
const H = 250

export function exportPDF(frontCanvas, backCanvas) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [W, H] })

  const frontImg = frontCanvas.toDataURL({ format: 'jpeg', quality: 0.95, multiplier: 2 })
  pdf.addImage(frontImg, 'JPEG', 0, 0, W, H)

  pdf.addPage()
  const backImg = backCanvas.toDataURL({ format: 'jpeg', quality: 0.95, multiplier: 2 })
  pdf.addImage(backImg, 'JPEG', 0, 0, W, H)

  pdf.save('datasheet.pdf')
}
