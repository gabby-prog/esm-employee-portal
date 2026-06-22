<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Elite Sports Management | Admin Mode</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body class="admin-page">
  <header class="topbar">
    <div class="brand-lockup" aria-label="Elite Sports Management logo">
      <img class="brand-logo-small" src="assets/esm-logo.png" alt="Elite Sports Management logo" />
      <div>
        <div class="brand-name">Elite Sports Management</div>
        <div class="brand-subtitle">Admin Mode</div>
      </div>
    </div>
    <nav class="top-actions site-nav">
      <a class="nav-link" href="index.html">Home</a>
      <a class="nav-link" href="employee-access.html">Employee Access</a>
      <a class="nav-link" href="pto-request.html">PTO Request</a>
      <a class="nav-link" href="benefits-guide.html">Benefits Guide</a>
      <a class="nav-link primary-nav" href="admin-dashboard.html">Admin Mode</a>
    </nav>
  </header>

  <main>
    <section id="adminPanel" class="panel admin-panel" data-page="admin">
      <div class="section-title">
        <div>
          <h2>Gabby &amp; LB Admin Mode</h2>
          <p>Admin tools for employees, PINs, PTO reports, and notes. PTO requests from Google Forms appear as pending until you mark them paid/processed or manually enter approved usage.</p>
        </div>
        <div class="button-group">
          <button class="primary" onclick="openEmployeeEditor()">Add Employee</button>
          <button class="ghost" onclick="exportCsv('balances')">Export PTO Balances <span class="info-bubble" title="Shows each employee’s current PTO position, including vacation, sick, and personal time earned, used, and remaining.">ⓘ</span></button>
          <button class="ghost" onclick="exportCsv('usage')">Export PTO Usage <span class="info-bubble" title="Exports the PTO history log, showing each PTO entry by employee, date used, PTO type, hours used, and notes.">ⓘ</span></button>
          <button class="ghost backup-action" onclick="exportPortalBackup()">Export Portal Data Backup</button>
          <label class="ghost backup-action import-backup-label" for="portalBackupInput">Import Portal Data</label>
          <input id="portalBackupInput" class="hidden-file-input" type="file" accept="application/json,.json" onchange="importPortalBackup(event)" />
        </div>
      </div>

      <div class="dashboard-grid" id="dashboardCards"></div>
      <div id="dashboardDrilldown"></div>

      <div class="admin-filters">
        <input id="adminSearchInput" type="search" placeholder="Search employees..." oninput="renderAdminTable()" />
        <select id="statusFilter" onchange="renderAdminTable()">
          <option value="Active">Active employees</option>
          <option value="Inactive">Inactive employees</option>
          <option value="All">All employees</option>
        </select>
        <select id="reviewFilter" onchange="renderAdminTable()">
          <option value="All">All records</option>
          <option value="Needs Review">Needs review</option>
          <option value="PIN Needed">PIN needed</option>
          <option value="Overrides">Benefit overrides</option>
        </select>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Hire Date</th><th>Years</th><th>PIN</th><th>Vacation</th><th>Sick</th><th>Personal</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody id="adminEmployeeTable"></tbody>
        </table>
      </div>

      <div class="report-grid">
        <section class="report-card">
          <div class="section-title compact"><div><h3>Pending PTO Requests</h3><p>Submitted through the Google Form but not yet marked paid/processed. These do not affect employee balances.</p></div></div>
          <div class="table-wrap report"><table><thead><tr><th>Employee</th><th>Date Used</th><th>Type</th><th>Amount Requested</th><th>Date Submitted</th><th>Desired Paycheck</th><th>Status</th><th>Admin Note</th><th>Decision</th></tr></thead><tbody id="pendingPtoTable"></tbody></table></div>
        </section>
        <section class="report-card">
          <div class="section-title compact"><div><h3>PTO Balance Report <span class="info-bubble" title="Shows each employee’s current PTO position, including vacation, sick, and personal time earned, used, and remaining.">ⓘ</span></h3><p>Earned, used, and remaining balances for active employees.</p></div><button class="ghost mini" onclick="exportCsv('balances')">Export CSV</button></div>
          <div class="table-wrap report"><table><thead><tr><th>Employee</th><th>Vac Earned</th><th>Vac Used</th><th>Vac Rem</th><th>Sick Earned</th><th>Sick Used</th><th>Sick Rem</th><th>Personal Earned</th><th>Personal Used</th><th>Personal Rem</th></tr></thead><tbody id="ptoBalanceTable"></tbody></table></div>
        </section>
        <section class="report-card">
          <div class="section-title compact"><div><h3>PTO Usage Report <span class="info-bubble" title="Shows the full PTO history log by employee, date used, PTO type, amount used, and notes.">ⓘ</span></h3><p>Approved/admin-entered PTO usage that affects balances.</p></div><button class="ghost mini" onclick="exportCsv('usage')">Export CSV</button></div>
          <div class="table-wrap report"><table><thead><tr><th>Employee</th><th>Date Used</th><th>Type</th><th>Amount</th><th>Notes</th></tr></thead><tbody id="ptoUsageTable"></tbody></table></div>
        </section>
      </div>
    </section>

  <div id="modalBackdrop" class="modal-backdrop hidden" onclick="closeModal(event)">
    <div class="modal wide" onclick="event.stopPropagation()">
      <div class="modal-header"><h3 id="modalTitle">Edit Employee</h3><button class="icon-btn" onclick="hideModal()">×</button></div>
      <form id="employeeForm" onsubmit="saveEmployee(event)">
        <input type="hidden" id="editEmployeeId" />
        <div class="form-grid">
          <label>Employee Name<input id="editName" required /></label>
          <label>Birthday PIN (MMDD)<input id="editPin" inputmode="numeric" maxlength="4" placeholder="0315" /></label>
          <label>Hire Date<input id="editHireDate" type="date" required /></label>
          <label>Hours Available<input id="editHoursAvailable" placeholder="Inquire about hours available" /></label>
          <label>Status<select id="editStatus"><option>Active</option><option>Inactive</option></select></label>
          <label>Maternity/Paternity Leave<select id="editFamilyLeave"><option value="">None</option><option>Maternity Leave</option><option>Paternity Leave</option></select></label>
          <label>Inactive Reason<select id="editInactiveReason"><option value="">None</option><option>College / Seasonal Return</option><option>Leave of Absence</option><option>Seasonal Employee</option><option>Resigned</option><option>Terminated</option><option>Retired</option><option>Other</option></select></label>
          <label>Inactive Date<input id="editInactiveDate" type="date" /></label>
          <label>Reactivation Date<input id="editReactivationDate" type="date" /></label>
          <label>Vacation Earned Override<input id="editVacationOverride" type="number" min="0" step="0.25" placeholder="Leave blank for auto" /></label>
          <label>Sick Earned Override<input id="editSickOverride" type="number" min="0" step="0.25" placeholder="Leave blank for auto" /></label>
          <label>Personal Earned Override<input id="editPersonalOverride" type="number" min="0" step="0.25" placeholder="Leave blank for auto" /></label>
          <label>Vacation Used Override<input id="editVacationUsedOverride" type="number" min="0" step="0.25" placeholder="Leave blank for sheet/admin total" /></label>
          <label>Sick Used Override<input id="editSickUsedOverride" type="number" min="0" step="1" placeholder="Leave blank for sheet/admin total" /></label>
          <label>Personal Used Override<input id="editPersonalUsedOverride" type="number" min="0" step="1" placeholder="Leave blank for sheet/admin total" /></label>
        </div>
        <label>Employee Notes <span class="hint">visible to employee</span><textarea id="editEmployeeNotes" rows="3"></textarea></label>
        <label>HR Notes <span class="hint">admin only</span><textarea id="editHrNotes" rows="3"></textarea></label>
        <label>Finance Notes <span class="hint">admin only</span><textarea id="editFinanceNotes" rows="3"></textarea></label>
        <label>Employment History Blocks <span class="hint">admin only - one line per block: Start Date | Inactive Date | Reactivation Date | Reason | Active</span><textarea id="editEmploymentHistory" rows="4" placeholder="2020-01-01 | 2022-05-01 | 2023-08-15 | College / Seasonal Return |
2023-08-15 | | | | Active"></textarea></label>
        <fieldset class="override-box"><legend>Benefit Overrides</legend><label><input id="overrideHco" type="checkbox" /> HCO Eligible</label><label><input id="overrideErsp" type="checkbox" /> ERSP Eligible</label><label><input id="overrideTuition" type="checkbox" /> Tuition Benefit Eligible</label></fieldset>
        <fieldset class="override-box"><legend>PTO Usage Log</legend>
          <div class="usage-entry-row"><input id="usageDate" type="date" /><select id="usageType"><option>Vacation</option><option>Sick</option><option>Personal</option></select><input id="usageAmount" type="number" min="0.25" step="0.25" value="1" /><input id="usageNotes" placeholder="Notes" /><button type="button" class="primary mini" onclick="addPtoUsage()">Add Usage</button></div>
          <div id="ptoUsageList"></div>
        </fieldset>
        <div class="modal-actions"><button type="button" class="ghost" onclick="hideModal()">Cancel</button><button type="submit" class="primary">Save Employee</button></div>
      </form>
    </div>
  </div>
  </main>

  <script src="app.js"></script>
</body>
</html>