// invoice-print.js
// Shared invoice/receipt printing — opens a clean, print-friendly window
// with the order details and triggers the browser's print dialog.
// Works for both a freshly-created order and reprinting an old one.

export function printInvoice(order, shop) {
  const shopName = (shop && shop.shopName) || 'FRALEN Optical';
  const shopPhone = (shop && shop.phone) || '';
  const items = order.products || [];
  const totals = order.totals || {};
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '-';

  const rowsHtml = items.map(it => `
    <tr>
      <td>${escapeHtml(it.name || it.type || 'Item')}</td>
      <td class="c">1</td>
      <td class="r">${Number(it.price || 0).toFixed(2)}</td>
      <td class="c">${it.gstPct || 0}%</td>
      <td class="c">${it.discPct || 0}%</td>
      <td class="r">${Number(it.total || 0).toFixed(2)}</td>
    </tr>`).join('') || `<tr><td colspan="6" class="c" style="padding:14px;color:#888">No items</td></tr>`;

  const discountTotal = (totals.itemDiscount || 0) + (totals.couponDiscount || 0) + (totals.loyaltyDiscount || 0);

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Invoice ${escapeHtml(order.orderNo || '')}</title>
<style>
  * { box-sizing: border-box; margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; }
  body { padding: 24px; color: #111; max-width: 620px; margin: 0 auto; }
  .head { text-align:center; border-bottom: 3px solid #1B2A6B; padding-bottom: 14px; margin-bottom: 16px; }
  .head h1 { color: #1B2A6B; font-size: 24px; letter-spacing: 1px; }
  .head p { color:#555; font-size: 12px; margin-top: 4px; }
  .meta { display:flex; justify-content:space-between; font-size: 13px; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
  .meta div div:first-child { color:#888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta div div:last-child { font-weight: 700; }
  table { width:100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background:#1B2A6B; color:white; font-size: 11px; text-transform: uppercase; padding: 8px 6px; text-align:left; }
  td { padding: 7px 6px; border-bottom: 1px solid #eee; font-size: 13px; }
  .c { text-align:center; } .r { text-align:right; }
  .totals { width: 260px; margin-left: auto; font-size: 13px; }
  .totals div { display:flex; justify-content:space-between; padding: 4px 0; }
  .totals .grand { font-weight:800; font-size:15px; color:#1B2A6B; border-top: 2px solid #1B2A6B; margin-top: 6px; padding-top: 8px; }
  .totals .due { font-weight:700; color:#DC2626; }
  .footer { text-align:center; margin-top: 28px; padding-top: 14px; border-top: 1px dashed #ccc; color:#1B2A6B; font-weight:700; font-size: 14px; }
  .footer p { color:#888; font-weight:400; font-size: 11px; margin-top: 4px; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <div class="head">
    <h1>${escapeHtml(shopName)}</h1>
    <p>${shopPhone ? 'Phone: ' + escapeHtml(shopPhone) : ''}</p>
    <p style="margin-top:8px;font-weight:700;color:#1B2A6B">SALES INVOICE</p>
  </div>
  <div class="meta">
    <div><div>Customer</div><div>${escapeHtml(order.customerName || '-')}</div></div>
    <div><div>Mobile</div><div>${escapeHtml(order.mobile || '-')}</div></div>
    <div><div>Order No.</div><div>${escapeHtml(order.orderNo || '-')}</div></div>
    <div><div>Date</div><div>${dateStr}</div></div>
  </div>
  <table>
    <thead><tr><th>Product</th><th class="c">Qty</th><th class="r">Price</th><th class="c">GST</th><th class="c">Disc</th><th class="r">Total</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div class="totals">
    <div><span>Basic Amount</span><span>Rs. ${(totals.basic || 0).toFixed(2)}</span></div>
    <div><span>GST</span><span>Rs. ${(totals.gst || 0).toFixed(2)}</span></div>
    <div><span>Discount</span><span>Rs. ${discountTotal.toFixed(2)}</span></div>
    <div class="grand"><span>Payable Amount</span><span>Rs. ${(totals.payable || 0).toFixed(2)}</span></div>
    <div><span>Advance Paid</span><span>Rs. ${(totals.advance || 0).toFixed(2)}</span></div>
    ${(totals.pending || 0) > 0 ? `<div class="due"><span>Balance Due</span><span>Rs. ${(totals.pending || 0).toFixed(2)}</span></div>` : ''}
  </div>
  <div class="footer">
    Thank you for purchasing from ${escapeHtml(shopName)}! 🙏
    <p>This is a computer-generated invoice.</p>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body></html>`;

  const printWin = window.open('', '_blank', 'width=700,height=900');
  if (!printWin) { alert('Popup block ho gaya — is site ke liye popups allow karo aur dobara try karo.'); return; }
  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
