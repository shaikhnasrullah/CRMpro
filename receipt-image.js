// receipt-image.js
// Builds ONE combined receipt image (shop name + order details + amounts +
// "Thank you" note, all in a single canvas) and lets it be shared directly
// to WhatsApp (or downloaded). Shared by customers.html, create-order.html,
// and sales-history.html so every "send to customer" flow looks the same.

export function drawReceiptCanvas(canvas, customerName, customerMobile, order, shopName) {
  const items = order.products || [];
  const hasRx = !!(order.hasLens && order.prescription);
  const W = 600;
  const rowH = 26;
  // Extra height reserved for the prescription block when present.
  const rxHeight = hasRx ? 190 : 0;
  const H = 300 + items.length * rowH + 190 + rxHeight;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Header band — shop name front and center
  ctx.fillStyle = '#1B2A6B';
  ctx.fillRect(0, 0, W, 90);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(shopName, W / 2, 40);
  ctx.font = '400 13px Arial';
  ctx.fillStyle = '#C7D2FE';
  ctx.fillText('Sales Receipt' + (hasRx ? ' & Eye Prescription' : ''), W / 2, 65);

  let y = 120;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111827';
  ctx.font = '700 16px Arial';
  ctx.fillText(customerName || '-', 30, y);
  ctx.font = '400 13px Arial';
  ctx.fillStyle = '#6B7280';
  y += 20;
  ctx.fillText('Mobile: ' + (customerMobile && customerMobile !== 'unknown' ? customerMobile : '-'), 30, y);
  ctx.textAlign = 'right';
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '-';
  ctx.fillText('Order No: ' + (order.orderNo || '-'), W - 30, y - 20);
  ctx.fillText('Date: ' + dateStr, W - 30, y);

  y += 20;
  ctx.strokeStyle = '#E5E7EB';
  ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();

  // Products table header
  y += 26;
  ctx.textAlign = 'left';
  ctx.font = '700 12px Arial';
  ctx.fillStyle = '#1B2A6B';
  ctx.fillText('PRODUCT', 30, y);
  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT (Rs)', W - 30, y);

  y += 10;
  ctx.strokeStyle = '#1B2A6B';
  ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();

  ctx.font = '400 13px Arial';
  items.forEach((it) => {
    y += rowH;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#111827';
    ctx.fillText(`${it.name || it.type || 'Item'}`, 30, y);
    ctx.textAlign = 'right';
    ctx.fillText((it.total || 0).toFixed(2), W - 30, y);
  });

  y += 16;
  ctx.strokeStyle = '#E5E7EB';
  ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();

  // Totals — all amounts combined into this same image
  const totals = order.totals || {};
  const totalLines = [
    ['Basic Amount', totals.basic],
    ['GST', totals.gst],
    ['Discount', (totals.itemDiscount || 0) + (totals.couponDiscount || 0) + (totals.loyaltyDiscount || 0)],
  ];
  y += 24;
  ctx.font = '400 12.5px Arial';
  ctx.fillStyle = '#6B7280';
  totalLines.forEach(([lbl, val]) => {
    ctx.textAlign = 'left'; ctx.fillText(lbl, 30, y);
    ctx.textAlign = 'right'; ctx.fillText('Rs. ' + (val || 0).toFixed(2), W - 30, y);
    y += 20;
  });

  ctx.font = '700 16px Arial';
  ctx.fillStyle = '#1B2A6B';
  ctx.textAlign = 'left'; ctx.fillText('Payable Amount', 30, y);
  ctx.textAlign = 'right'; ctx.fillText('Rs. ' + (totals.payable || 0).toFixed(2), W - 30, y);

  y += 24;
  ctx.font = '400 13px Arial';
  ctx.fillStyle = '#059669';
  ctx.textAlign = 'left'; ctx.fillText('Advance Paid', 30, y);
  ctx.textAlign = 'right'; ctx.fillText('Rs. ' + (totals.advance || 0).toFixed(2), W - 30, y);

  if ((totals.pending || 0) > 0) {
    y += 20;
    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'left'; ctx.fillText('Balance Due', 30, y);
    ctx.textAlign = 'right'; ctx.fillText('Rs. ' + (totals.pending || 0).toFixed(2), W - 30, y);
  }

  // Eye Prescription — combined into the SAME image, right after the order totals.
  if (hasRx) {
    const rx = order.prescription;
    y += 34;
    ctx.strokeStyle = '#E5E7EB';
    ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();

    y += 26;
    ctx.textAlign = 'left';
    ctx.font = '700 13px Arial';
    ctx.fillStyle = '#1B2A6B';
    ctx.fillText('👁 EYE PRESCRIPTION', 30, y);

    // Mini table: columns SPH / CYL / AXIS / ADD, rows R / L
    const colX = [30, 130, 220, 310, 400, 480];
    const headers = ['Eye', 'SPH', 'CYL', 'AXIS', 'ADD', 'V/A'];
    y += 22;
    ctx.font = '700 10.5px Arial';
    ctx.fillStyle = '#6B7280';
    headers.forEach((h, i) => ctx.fillText(h, colX[i], y));

    y += 6;
    ctx.strokeStyle = '#E5E7EB';
    ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();

    const eyeRow = (label, eye) => {
      y += 24;
      ctx.font = '700 12px Arial';
      ctx.fillStyle = '#1B2A6B';
      ctx.fillText(label, colX[0], y);
      ctx.font = '400 12.5px Arial';
      ctx.fillStyle = '#111827';
      ctx.fillText(eye.sph || '-', colX[1], y);
      ctx.fillText(eye.cyl || '-', colX[2], y);
      ctx.fillText(eye.axis || '-', colX[3], y);
      ctx.fillText(eye.add || '-', colX[4], y);
      ctx.fillText(eye.va || '-', colX[5], y);
    };
    eyeRow('R', rx.re || {});
    eyeRow('L', rx.le || {});

    y += 26;
    ctx.font = '400 12px Arial';
    ctx.fillStyle = '#374151';
    const extras = [
      rx.pd ? `PD: ${rx.pd}mm` : null,
      rx.lensType ? `Lens: ${rx.lensType}` : null,
      rx.coating ? `Coating: ${rx.coating}` : null,
    ].filter(Boolean).join('   |   ');
    if (extras) ctx.fillText(extras, 30, y);
    if (rx.doctor) { y += 18; ctx.fillText(`Prescribed by: ${rx.doctor}`, 30, y); }
  }

  // Footer — thank-you message combined into the same image
  y += 40;
  ctx.strokeStyle = '#E5E7EB';
  ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
  y += 30;
  ctx.textAlign = 'center';
  ctx.font = '600 14px Arial';
  ctx.fillStyle = '#1B2A6B';
  ctx.fillText(`Thank you for purchasing from ${shopName}! 🙏`, W / 2, y);
  y += 20;
  ctx.font = '400 11.5px Arial';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText('We look forward to serving you again.', W / 2, y);
}

/** Renders the receipt to an off-screen canvas and resolves with a PNG Blob. */
export function buildReceiptBlob(customerName, customerMobile, order, shopName) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    drawReceiptCanvas(canvas, customerName, customerMobile, order, shopName);
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

/**
 * Tries the native share sheet (mobile) so WhatsApp gets the image directly.
 * Falls back to downloading the image + opening a WhatsApp chat with a text
 * note, for desktop or browsers without file-sharing support.
 */
export async function shareReceiptOnWhatsApp(customerName, customerMobile, order, shopName) {
  const blob = await buildReceiptBlob(customerName, customerMobile, order, shopName);
  const file = new File([blob], 'receipt.png', { type: 'image/png' });
  const text = `Thank you for purchasing from ${shopName}! 🙏`;

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return;
    } catch (e) { /* user cancelled the share sheet */ }
  }

  downloadBlob(blob, customerName);
  const mobile = (customerMobile || '').replace(/\D/g, '');
  const waNumber = mobile.length === 10 ? '91' + mobile : mobile;
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text + ' (Receipt image downloaded — attach it here)')}`, '_blank');
}

export function downloadBlob(blob, customerName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Receipt_${(customerName || 'customer').replace(/\s+/g, '_')}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

