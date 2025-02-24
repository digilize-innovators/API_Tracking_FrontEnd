export const headerContentFix = (doc, name) => {
    const img = new Image()
    img.src = '/images/brand.png'
    const logoWidth = 45
    const logoHeight = 28
    const logoX = doc.internal.pageSize.width - logoWidth - 12
    const logoY = 8
    doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight)
    doc.setFontSize(16).setFont(undefined, 'bold').text(name, 70, 14)
  }