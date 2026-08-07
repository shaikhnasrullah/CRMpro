// prescription-print.js
// Prints a clean, doctor-style eye prescription card — separate from the
// sales invoice. Used wherever an order has hasLens + prescription data.

export function printPrescription(order, shop) {
  if (!order.prescription) { alert('Is order ke saath koi prescription save nahi hai.'); return; }
  const shopName = (shop && shop.shopName) || 'FRALEN Optical';
  const shopPhone = (shop && shop.phone) || '';
  const rx = order.prescription;
  const testDateStr = rx.date ? new Date(rx.date).toLocaleDateString('en-IN') : (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '-');

  const eyeRow = (label, eye) => `
    <tr>
      <td class="eye-lbl">${label}</td>
      <td>${eye.sph || '-'}</td>
      <td>${eye.cyl || '-'}</td>
      <td>${eye.axis || '-'}</td>
      <td>${eye.add || '-'}</td>
      <td>${eye.va || '-'}</td>
    </tr>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Prescription — ${escapeHtml(order.customerName || '')}</title>
<style>
  * { box-sizing: border-box; margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; }
  body { padding: 24px; color: #111; max-width: 560px; margin: 0 auto; }
  .card { border: 2px solid #1B2A6B; border-radius: 10px; overflow: hidden; }
  .head { background:#1B2A6B; color:white; text-align:center; padding: 18px; }
  .head h1 { font-size: 20px; letter-spacing: 1px; }
  .head p { font-size: 11.5px; color:#C7D2FE; margin-top: 4px; }
  .head .rx-title { margin-top: 10px; font-size: 14px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
  .body { padding: 20px; }
  .meta { display:flex; justify-content:space-between; font-size: 13px; margin-bottom: 18px; flex-wrap:wrap; gap:10px; }
  .meta div div:first-child { color:#888; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta div div:last-child { font-weight: 700; margin-top:2px; }
  table { width:100%; border-collapse: collapse; margin-bottom: 18px; }
  th { background:#EEF1FE; color:#1B2A6B; font-size: 11px; text-transform: uppercase; padding: 9px 6px; text-align:center; border: 1px solid #DCE4FF; }
  td { padding: 12px 6px; border: 1px solid #E5E7EB; font-size: 15px; text-align:center; font-weight:600; }
  .eye-lbl { background:#F9FAFB; font-weight:700; color:#1B2A6B; font-size:12px; }
  .extra-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; font-size: 13px; margin-bottom: 14px; }
  .extra-grid div div:first-child { color:#888; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; }
  .extra-grid div div:last-child { font-weight: 700; margin-top:2px; }
  .remarks { background:#F9FAFB; border-radius:8px; padding: 10px 12px; font-size: 12.5px; color:#374151; margin-bottom: 6px; }
  .footer { text-align:center; padding: 14px; border-top: 1px dashed #ccc; color:#1B2A6B; font-weight:700; font-size: 13px; }
  .footer p { color:#9CA3AF; font-weight:400; font-size: 11px; margin-top: 4px; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <div class="card">
    <div class="head">
      <h1>${escapeHtml(shopName)}</h1>
      <p>${shopPhone ? 'Phone: ' + escapeHtml(shopPhone) : ''}</p>
      <div class="rx-title">👁 Eye Prescription Card</div>
    </div>
    <div class="body">
      <div class="meta">
        <div><div>Patient Name</div><div>${escapeHtml(order.customerName || '-')}</div></div>
        <div><div>Mobile</div><div>${escapeHtml(order.mobile || '-')}</div></div>
        <div><div>Test Date</div><div>${testDateStr}</div></div>
      </div>

      <table>
        <thead><tr><th>Eye</th><th>SPH</th><th>CYL</th><th>AXIS</th><th>ADD</th><th>V/A</th></tr></thead>
        <tbody>
          ${eyeRow('Right (R)', rx.re || {})}
          ${eyeRow('Left (L)', rx.le || {})}
        </tbody>
      </table>

      <div class="extra-grid">
        <div><div>PD (mm)</div><div>${escapeHtml(rx.pd || '-')}</div></div>
        <div><div>Lens Type</div><div>${escapeHtml(rx.lensType || '-')}</div></div>
        <div><div>Coating</div><div>${escapeHtml(rx.coating || '-')}</div></div>
        <div><div>Frame Fitting</div><div>${escapeHtml(rx.fitting || '-')}</div></div>
        <div><div>Prescribed By</div><div>${escapeHtml(rx.doctor || '-')}</div></div>
      </div>

      ${rx.remarks ? `<div class="remarks"><b>Remarks:</b> ${escapeHtml(rx.remarks)}</div>` : ''}
    </div>
    <div class="footer">
      ${escapeHtml(shopName)}
      <p>We recommend a repeat eye checkup after 12 months.</p>
    </div>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body></html>`;

  const printWin = window.open('', '_blank', 'width=650,height=850');
  if (!printWin) { alert('Popup block ho gaya — is site ke liye popups allow karo aur dobara try karo.'); return; }
  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
