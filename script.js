let globalDatabaseCollection = [];
        let corporateLogoDataUri = "sanaa-global-ltd-logo.png"; // Fallback asset path pointer

        document.addEventListener("DOMContentLoaded", () => {
            window.lucide?.createIcons?.();

            const localSavedData = localStorage.getItem('sanaa_receipts');
            if (localSavedData) {
                globalDatabaseCollection = JSON.parse(localSavedData);
            }

            // Restore persistent workplace micro-state session parameters if present
            if (document.getElementById('inpSender')) {
                restoreStateSnapshotFromCache();
                toggleInstrumentGateways();
            }

            if (document.getElementById('dashboardTotalReceipts')) {
                renderDashboardOverview();
            }

            if (document.getElementById('tab-purchases') || document.getElementById('tab-saved')) {
                const pageHash = window.location.hash.slice(1);
                if (pageHash === 'saved') {
                    switchTab('saved');
                } else if (pageHash === 'purchases') {
                    switchTab('purchases');
                } else {
                    switchTab('purchases');
                }
            }
        });

        function toggleInstrumentGateways() {
            const currentSelectedMethod = document.getElementById('inpMethod').value;
            const bankWrapper = document.getElementById('bankGateWrapper');
            const refWrapper = document.getElementById('refGateWrapper');
            const bankInput = document.getElementById('inpBank');
            const refInput = document.getElementById('inpRef');

            if (currentSelectedMethod === 'Cash') {
                bankWrapper.classList.add('opacity-30', 'pointer-events-none');
                refWrapper.classList.add('opacity-30', 'pointer-events-none');
                bankInput.setAttribute('tabindex', '-1');
                refInput.setAttribute('tabindex', '-1');
                bankInput.value = '';
                refInput.value = '';
            } else {
                bankWrapper.classList.remove('opacity-30', 'pointer-events-none');
                refWrapper.classList.remove('opacity-30', 'pointer-events-none');
                bankInput.removeAttribute('tabindex');
                refInput.removeAttribute('tabindex');
            }
            writeStateSnapshotToCache();
            runLiveDocMirrorSynchronization();
        }

        function switchTab(displayTargetId) {
            const tabDashboard = document.getElementById('tab-dashboard');
            const tabPurchases = document.getElementById('tab-purchases');
            const tabSaved = document.getElementById('tab-saved');
            const navDashboard = document.getElementById('nav-dashboard');
            const navPurchases = document.getElementById('nav-purchases');
            const navSaved = document.getElementById('nav-saved');

            if (tabDashboard) {
                tabDashboard.classList.toggle('hidden', displayTargetId !== 'dashboard');
            }
            if (tabPurchases) {
                tabPurchases.classList.toggle('hidden', displayTargetId !== 'purchases');
            }
            if (tabSaved) {
                tabSaved.classList.toggle('hidden', displayTargetId !== 'saved');
            }

            if (navDashboard) {
                navDashboard.className = displayTargetId === 'dashboard'
                    ? "px-5 py-3 flex items-center space-x-3 bg-blue-600 text-white font-semibold cursor-pointer border-l-4 border-blue-400 shadow-sm transition-all"
                    : "px-5 py-3 flex items-center space-x-3 hover:bg-slate-800/60 hover:text-white text-slate-400 cursor-pointer transition-all";
            }
            if (navPurchases) {
                navPurchases.className = displayTargetId === 'purchases'
                    ? "px-5 py-3 flex items-center space-x-3 bg-blue-600 text-white font-semibold cursor-pointer border-l-4 border-blue-400 shadow-sm transition-all"
                    : "px-5 py-3 flex items-center space-x-3 hover:bg-slate-800/60 hover:text-white text-slate-400 cursor-pointer transition-all";
            }
            if (navSaved) {
                navSaved.className = displayTargetId === 'saved'
                    ? "px-5 py-3 flex items-center space-x-3 bg-blue-600 text-white font-semibold cursor-pointer border-l-4 border-blue-400 shadow-sm transition-all"
                    : "px-5 py-3 flex items-center space-x-3 hover:bg-slate-800/60 hover:text-white text-slate-400 cursor-pointer transition-all";
            }

            if (displayTargetId === 'dashboard' && document.getElementById('dashboardTotalReceipts')) {
                renderDashboardOverview();
            } else if (displayTargetId === 'purchases') {
                runLiveDocMirrorSynchronization();
            } else if (displayTargetId === 'saved') {
                renderTableRecordsListUI();
            }
        }

        function runCalculationEngineSequence() {
            const rawInputStringDate = document.getElementById('inpDate').value;
            if (!rawInputStringDate) return;

            const operationalDateObj = new Date(rawInputStringDate);
            const stringYear = operationalDateObj.getFullYear();
            const stringMonth = String(operationalDateObj.getMonth() + 1).padStart(2, '0');

            const targetMonthPrefix = `${stringYear}-${stringMonth}/`;
            const matchingReceipts = globalDatabaseCollection.filter(item => item.receiptNo && item.receiptNo.startsWith(targetMonthPrefix));

            let nextSequenceNumber = 1;
            if (matchingReceipts.length > 0) {
                const numericSuffixes = matchingReceipts.map(item => {
                    const parts = item.receiptNo.split('/');
                    return parts.length > 1 ? parseInt(parts[parts.length - 1], 10) : 0;
                }).filter(num => !isNaN(num));

                if (numericSuffixes.length > 0) {
                    nextSequenceNumber = Math.max(...numericSuffixes) + 1;
                }
            }

            let stringSerial = String(nextSequenceNumber).padStart(3, '0');
            if (nextSequenceNumber >= 1000) stringSerial = nextSequenceNumber;

            const exactReceiptIdHashText = `${stringYear}-${stringMonth}/${stringSerial}`;
            document.getElementById('inpReceiptNo').value = exactReceiptIdHashText;

            writeStateSnapshotToCache();
            runLiveDocMirrorSynchronization();
        }

        function convertNumberToWords(amountNumberValue) {
            if (!amountNumberValue || isNaN(amountNumberValue) || parseFloat(amountNumberValue) === 0) return "";
            let absoluteNumber = Math.floor(parseFloat(amountNumberValue));
            const singleUnits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
            const tensPrefix = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

            function computeSubChunk(num) {
                let r = "";
                if (num >= 100) { r += singleUnits[Math.floor(num / 100)] + " Hundred "; num %= 100; }
                if (num >= 20) { r += tensPrefix[Math.floor(num / 10)] + " "; num %= 10; }
                if (num > 0) r += singleUnits[num] + " ";
                return r;
            }

            let output = "";
            if (Math.floor(absoluteNumber / 10000000) > 0) { output += computeSubChunk(Math.floor(absoluteNumber / 10000000)) + "Crore "; absoluteNumber %= 10000000; }
            if (Math.floor(absoluteNumber / 100000) > 0) { output += computeSubChunk(Math.floor(absoluteNumber / 100000)) + "Lakh "; absoluteNumber %= 100000; }
            if (Math.floor(absoluteNumber / 1000) > 0) { output += computeSubChunk(Math.floor(absoluteNumber / 1000)) + "Thousand "; absoluteNumber %= 1000; }
            if (absoluteNumber > 0) output += computeSubChunk(absoluteNumber);
            return output.trim() + " Taka Only";
        }

        function handleRealtimeNumericConversion() {
            const num = document.getElementById('inpAmount').value;
            if (num && !isNaN(num)) {
                document.getElementById('inpWords').value = convertNumberToWords(num);
            } else {
                document.getElementById('inpWords').value = '';
            }
            writeStateSnapshotToCache();
            runLiveDocMirrorSynchronization();
        }

        function runLiveDocMirrorSynchronization() {
            const rawDate = document.getElementById('inpDate').value;
            let structuredPrintDate = '__________';
            if (rawDate) {
                const dateObj = new Date(rawDate);
                structuredPrintDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }

            document.querySelectorAll('.lblDate, .lblDated').forEach(el => el.innerText = structuredPrintDate);

            const receiptNoText = document.getElementById('inpReceiptNo').value.trim() || '__________';
            document.querySelectorAll('.lblReceiptNo').forEach(el => el.innerText = receiptNoText);

            const sender = document.getElementById('inpSender').value.trim() || '__________________________________________________________________________';
            document.querySelectorAll('.lblSender').forEach(el => el.innerText = sender);

            const words = document.getElementById('inpWords').value.trim() || '____________________________________________________________________________________';
            document.querySelectorAll('.lblWords').forEach(el => el.innerText = words);

            const bank = document.getElementById('inpBank').value.trim() || '________________';
            document.querySelectorAll('.lblBank').forEach(el => el.innerText = bank);

            const ref = document.getElementById('inpRef').value.trim() || '________________';
            document.querySelectorAll('.lblRef').forEach(el => el.innerText = ref);

            const purpose = document.getElementById('inpPurpose').value.trim() || '__________________________________________________________________________';
            document.querySelectorAll('.lblPurpose').forEach(el => el.innerText = purpose);

            const rawNumericValueField = document.getElementById('inpAmount').value;
            let finalAmountText = "0.00";
            if (rawNumericValueField) {
                finalAmountText = parseFloat(rawNumericValueField).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            document.querySelectorAll('.lblAmount').forEach(el => el.innerText = finalAmountText);

            const method = document.getElementById('inpMethod').value;
            document.querySelectorAll('.boxCash').forEach(el => el.innerText = (method === 'Cash') ? '?' : '');
            document.querySelectorAll('.boxTransfer').forEach(el => el.innerText = (method === 'Online Line Transfer') ? '?' : '');
            document.querySelectorAll('.boxCheque').forEach(el => el.innerText = (method === 'Cheque') ? '?' : '');
        }

        function writeStateSnapshotToCache() {
            const stateObj = {
                receiptNo: document.getElementById('inpReceiptNo').value,
                sender: document.getElementById('inpSender').value,
                date: document.getElementById('inpDate').value,
                method: document.getElementById('inpMethod').value,
                bank: document.getElementById('inpBank').value,
                ref: document.getElementById('inpRef').value,
                purpose: document.getElementById('inpPurpose').value,
                amount: document.getElementById('inpAmount').value,
                words: document.getElementById('inpWords').value
            };
            sessionStorage.setItem('sanaa_workspace_snapshot', JSON.stringify(stateObj));
            localStorage.setItem('sanaa_workspace_snapshot', JSON.stringify(stateObj));
        }

        function restoreStateSnapshotFromCache() {
            const snapshotString = sessionStorage.getItem('sanaa_workspace_snapshot') || localStorage.getItem('sanaa_workspace_snapshot');
            if (snapshotString) {
                const state = JSON.parse(snapshotString);
                document.getElementById('inpSender').value = state.sender || '';
                document.getElementById('inpDate').value = state.date || new Date().toISOString().split('T')[0];
                document.getElementById('inpMethod').value = state.method || 'Cash';
                document.getElementById('inpBank').value = state.bank || '';
                document.getElementById('inpRef').value = state.ref || '';
                document.getElementById('inpPurpose').value = state.purpose || '';
                document.getElementById('inpAmount').value = state.amount || '';
                document.getElementById('inpWords').value = state.words || '';

                if (state.receiptNo) {
                    document.getElementById('inpReceiptNo').value = state.receiptNo;
                } else {
                    runCalculationEngineSequence();
                }
            } else {
                document.getElementById('inpDate').value = new Date().toISOString().split('T')[0];
                runCalculationEngineSequence();
            }
            runLiveDocMirrorSynchronization();
        }

        function commitRowDataToPersistentVault() {
            const receiptNoFieldVal = document.getElementById('inpReceiptNo').value.trim();
            const customerNameCheckVal = document.getElementById('inpSender').value.trim();
            const numericTotalCheckVal = document.getElementById('inpAmount').value;

            if (!receiptNoFieldVal) {
                alert('Validation Alert: Receipt Number registry configuration value cannot remain empty.');
                return;
            }
            if (!customerNameCheckVal || !numericTotalCheckVal) {
                alert('Validation Alert: Customer Name and Amount fields must contain valid parameters.');
                return;
            }

            const dataRowObjectInstance = {
                id: Date.now(),
                receiptNo: receiptNoFieldVal,
                date: document.getElementById('inpDate').value,
                sender: customerNameCheckVal,
                purpose: document.getElementById('inpPurpose').value.trim() || 'Vehicle Payment Settlement',
                method: document.getElementById('inpMethod').value,
                amount: parseFloat(numericTotalCheckVal),
                bank: document.getElementById('inpBank').value.trim(),
                ref: document.getElementById('inpRef').value.trim(),
                words: document.getElementById('inpWords').value
            };

            globalDatabaseCollection.push(dataRowObjectInstance);
            localStorage.setItem('sanaa_receipts', JSON.stringify(globalDatabaseCollection));

            sessionStorage.removeItem('sanaa_workspace_snapshot');
            localStorage.removeItem('sanaa_workspace_snapshot');
            alert(`Archived successfully! Receipt ${dataRowObjectInstance.receiptNo} logged into tracking records ledger.`);

            // Prepare the NEXT sequential step automatically based on what was just saved
            calculateNextStepSequence(receiptNoFieldVal);
            if (document.getElementById('dashboardTotalReceipts')) {
                renderDashboardOverview();
            }
        }

        function calculateNextStepSequence(lastReceiptNo) {
            // Check if there's a trailing slash matrix layout like 2026-06/030 or 2026-06/30
            if (lastReceiptNo.includes('/')) {
                const stringParts = lastReceiptNo.split('/');
                const basePrefixBlock = stringParts.slice(0, stringParts.length - 1).join('/');
                const finalSuffixPiece = stringParts[stringParts.length - 1];

                const parseNumericValue = parseInt(finalSuffixPiece, 10);
                if (!isNaN(parseNumericValue)) {
                    const upgradedValue = parseNumericValue + 1;
                    // Maintain custom matching padding layout dynamically
                    const zeroPaddingLength = finalSuffixPiece.length;
                    let freshPaddedSerial = String(upgradedValue).padStart(zeroPaddingLength, '0');

                    if (upgradedValue >= Math.pow(10, zeroPaddingLength)) {
                        freshPaddedSerial = String(upgradedValue);
                    }

                    clearWorkspaceInputBlocksWithoutResettingSequence(`${basePrefixBlock}/${freshPaddedSerial}`);
                    return;
                }
            }

            // Fallback tracking layout index rule if no division tokens exist
            const rawMatchTrailingDigits = lastReceiptNo.match(/\d+$/);
            if (rawMatchTrailingDigits) {
                const digitStringStr = rawMatchTrailingDigits[0];
                const numericalVal = parseInt(digitStringStr, 10);
                const nextValIncrement = numericalVal + 1;
                const freshPaddedValue = String(nextValIncrement).padStart(digitStringStr.length, '0');
                const cleanResultingBase = lastReceiptNo.substring(0, lastReceiptNo.length - digitStringStr.length);

                clearWorkspaceInputBlocksWithoutResettingSequence(cleanResultingBase + freshPaddedValue);
            } else {
                // Completely global clear default fallback 
                clearWorkspaceInputBlocks();
            }
        }

        function deleteReceiptRecord(uniqueRowId, receiptNumberString) {
            if (confirm(`Are you completely sure you want to permanently delete receipt entry: ${receiptNumberString}?`)) {
                globalDatabaseCollection = globalDatabaseCollection.filter(item => item.id !== uniqueRowId);
                localStorage.setItem('sanaa_receipts', JSON.stringify(globalDatabaseCollection));
                renderTableRecordsListUI();
                if (document.getElementById('dashboardTotalReceipts')) {
                    renderDashboardOverview();
                }
            }
        }

        function calculateLedgerMetrics() {
            let cashSum = 0; let bankSum = 0; let grossSum = 0;
            globalDatabaseCollection.forEach(item => {
                grossSum += item.amount;
                if (item.method === 'Cash') cashSum += item.amount;
                else bankSum += item.amount;
            });
            document.getElementById('metricCash').innerText = `TK ${cashSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
            document.getElementById('metricBank').innerText = `TK ${bankSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
            document.getElementById('metricTotal').innerText = `TK ${grossSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        }

        function formatTkAmount(amountValue) {
            const normalized = Number(amountValue) || 0;
            return `TK ${normalized.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        function calculateSuggestedReceipt(receiptNo) {
            if (!receiptNo) {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                return `${year}-${month}/001`;
            }

            if (receiptNo.includes('/')) {
                const parts = receiptNo.split('/');
                const suffix = parts.pop();
                const base = parts.join('/');
                const parsed = parseInt(suffix, 10);
                if (!isNaN(parsed)) {
                    const next = parsed + 1;
                    const padded = String(next).padStart(suffix.length, '0');
                    return `${base}/${padded}`;
                }
            }

            const trailingDigits = receiptNo.match(/\d+$/);
            if (trailingDigits) {
                const digits = trailingDigits[0];
                const next = parseInt(digits, 10) + 1;
                return receiptNo.slice(0, -digits.length) + String(next).padStart(digits.length, '0');
            }

            return `${receiptNo}/001`;
        }

        function renderDashboardOverview() {
            const totalReceipts = globalDatabaseCollection.length;
            let cashSum = 0;
            let bankSum = 0;
            let grossSum = 0;
            globalDatabaseCollection.forEach(item => {
                grossSum += item.amount;
                if (item.method === 'Cash') cashSum += item.amount;
                else bankSum += item.amount;
            });

            const latestReceipts = [...globalDatabaseCollection]
                .sort((a, b) => b.id - a.id)
                .slice(0, 5);

            const nextReceiptLabel = totalReceipts > 0
                ? calculateSuggestedReceipt(latestReceipts[0].receiptNo)
                : calculateSuggestedReceipt(document.getElementById('inpReceiptNo').value.trim());

            document.getElementById('dashboardTotalReceipts').innerText = `${totalReceipts} Receipt${totalReceipts === 1 ? '' : 's'}`;
            document.getElementById('dashboardTotalReceived').innerText = formatTkAmount(grossSum);
            document.getElementById('dashboardCashAmount').innerText = formatTkAmount(cashSum);
            document.getElementById('dashboardBankAmount').innerText = formatTkAmount(bankSum);
            document.getElementById('dashboardNextReceipt').innerText = nextReceiptLabel;
            document.getElementById('dashboardStatus').innerText = totalReceipts === 0 ? 'Terminal ready for first receipt' : 'Ledger updated successfully';

            const listRoot = document.getElementById('dashboardLatestReceiptsList');
            if (!listRoot) return;
            if (latestReceipts.length === 0) {
                listRoot.innerHTML = `<li class="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-500">No receipts yet. Save your first receipt to see history here.</li>`;
            } else {
                listRoot.innerHTML = latestReceipts.map(item => `
                    <li class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div class="flex items-center justify-between gap-3">
                            <div>
                                <div class="text-xs uppercase tracking-[0.35em] text-slate-400 font-semibold">${item.receiptNo}</div>
                                <div class="mt-2 text-sm text-slate-700">${item.sender || 'Unknown customer'}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-bold text-slate-900">${formatTkAmount(item.amount)}</div>
                                <div class="text-[11px] text-slate-500 uppercase tracking-[0.2em] mt-1">${item.method}</div>
                            </div>
                        </div>
                    </li>
                `).join('');
            }
        }

        function renderTableRecordsListUI() {
            calculateLedgerMetrics();
            const tableNodeBodyElement = document.getElementById('registryTableBody');
            const dataCounterBadgeElement = document.getElementById('badgeCounter');

            dataCounterBadgeElement.innerText = `${globalDatabaseCollection.length} Receipts Logged`;

            if (globalDatabaseCollection.length === 0) {
                tableNodeBodyElement.innerHTML = `
                    <tr id="fallbackEmptyRow">
                        <td colspan="7" class="p-8 text-center text-slate-400 italic bg-gray-50/20">
                            No historical logs recorded. Complete form fields and click save inside workspace.
                        </td>
                    </tr>`;
                return;
            }

            tableNodeBodyElement.innerHTML = '';
            globalDatabaseCollection.forEach(itemDataObj => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50/80 border-b border-slate-100 text-slate-700 font-medium transition-colors";
                tr.innerHTML = `
                    <td class="p-4 font-mono font-bold text-blue-600">${itemDataObj.receiptNo}</td>
                    <td class="p-4 text-slate-500">${itemDataObj.date}</td>
                    <td class="p-4 font-semibold text-slate-900">${itemDataObj.sender}</td>
                    <td class="p-4 text-slate-500">${itemDataObj.purpose}</td>
                    <td class="p-4"><span class="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 border text-slate-600">${itemDataObj.method}</span></td>
                    <td class="p-4 text-right font-bold text-slate-900">TK ${itemDataObj.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td class="p-4 text-center flex items-center justify-center space-x-2">
                        <button onclick="launchReceiptPreviewModal(${itemDataObj.id})" class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-md transition-colors cursor-pointer inline-flex items-center justify-center" title="View Full Document">
                            <i data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteReceiptRecord(${itemDataObj.id}, '${itemDataObj.receiptNo}')" class="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-md transition-colors cursor-pointer inline-flex items-center justify-center" title="Delete Entry">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                `;
                tableNodeBodyElement.appendChild(tr);
            });

            window.lucide?.createIcons?.();
        }

        function launchReceiptPreviewModal(targetId) {
            const rowData = globalDatabaseCollection.find(item => item.id === targetId);
            if (!rowData) return;

            const targetFormattedDate = rowData.date ? new Date(rowData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '__________';
            const displayAmt = rowData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            const txtWords = rowData.words || '____________________________________________________________________________________';
            const txtBank = rowData.bank || '________________';
            const txtRef = rowData.ref || '________________';

            const multiCopyStructuralHtmlTemplate = `
                <!-- CUSTOMER COPY CONTAINER -->
                <div class="receipt-box bg-white p-5 flex flex-col justify-between border border-slate-200 rounded-xl relative min-h-[440px]">
                    <div class="absolute top-4 right-4 bg-slate-50 border border-slate-200/60 text-slate-400 text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase select-none no-print">
                        Customer Copy Replica
                    </div>
                    <div>
                        <div class="flex items-center space-x-4 border-b-2 border-slate-100 pb-3">
                            <div class="w-24 h-24 shrink-0 flex items-center justify-center bg-slate-50/50 rounded-lg overflow-hidden border border-slate-100">
                                <img class="object-contain max-w-full max-h-full" src="${corporateLogoDataUri}">
                            </div>
                            <div class="flex-1">
                                <h2 class="text-xl tracking-tight leading-none uppercase font-normal text-blue-900">
                                    <span class="font-broadway font-bold text-black mr-1.5">SANAA</span>
                                    <span class="tracking-tight">GLOBAL LTD.</span>
                                </h2>
                                <p class="text-[10px] text-slate-600 font-semibold mt-1.5 leading-snug">Plot # 05, Road # 05, Block # A, Section # 06, Mirpur, Dhaka 1216</p>
                                <p class="text-[9px] text-slate-500 font-medium mt-0.5">Phone: 01898923110, Email: sanaagloballtd@gmail.com</p>
                            </div>
                        </div>

                        <div class="text-center my-3">
                            <span class="text-xs font-black tracking-widest text-slate-900 border-b-2 border-slate-900 pb-0.5 uppercase inline-block italic">MONEY RECEIPT</span>
                        </div>

                        <div class="space-y-4 text-xs text-slate-900 font-bold">
                            <div class="flex justify-between items-end">
                                <div class="flex flex-1 max-w-[55%] items-baseline">
                                    <span class="text-slate-500 font-medium whitespace-nowrap mr-2">Receipt No:</span>
                                    <span class="receipt-underline font-mono font-extrabold text-blue-600 px-2 flex-1">${rowData.receiptNo}</span>
                                </div>
                                <div class="flex flex-1 max-w-[40%] items-baseline">
                                    <span class="text-slate-500 font-medium whitespace-nowrap mr-2">Date:</span>
                                    <span class="receipt-underline px-2 flex-1 font-semibold text-slate-800">${targetFormattedDate}</span>
                                </div>
                            </div>

                            <div class="flex items-baseline w-full">
                                <span class="text-slate-500 font-medium whitespace-nowrap mr-2">Received with thanks from:</span>
                                <span class="receipt-underline font-semibold text-slate-800 px-2 flex-1">${rowData.sender}</span>
                            </div>

                            <div class="flex items-baseline w-full">
                                <span class="text-slate-500 font-medium whitespace-nowrap mr-2">Amount of:</span>
                                <span class="receipt-underline text-slate-700 px-2 flex-1 italic font-medium">${txtWords}</span>
                            </div>

                            <div class="flex flex-wrap items-center gap-y-3 pt-1 text-[11px] font-bold text-slate-800 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60">
                                <div class="flex items-center mr-4">
                                    <span class="text-slate-500 font-medium mr-2">By Cash</span>
                                    <span class="w-4 h-4 border border-slate-400 text-center text-[10px] leading-4 font-black rounded bg-white inline-block text-blue-600">${rowData.method === 'Cash' ? '✓' : ''}</span>
                                </div>
                                <div class="flex items-center mr-4">
                                    <span class="text-slate-500 font-medium mr-2">/ Online Transfer</span>
                                    <span class="w-4 h-4 border border-slate-400 text-center text-[10px] leading-4 font-black rounded bg-white inline-block text-blue-600">${rowData.method === 'Online Line Transfer' ? '✓' : ''}</span>
                                </div>
                                <div class="flex items-center mr-4">
                                    <span class="text-slate-500 font-medium mr-2">/ Cheque</span>
                                    <span class="w-4 h-4 border border-slate-400 text-center text-[10px] leading-4 font-black rounded bg-white inline-block text-blue-600">${rowData.method === 'Cheque' ? '✓' : ''}</span>
                                </div>
                                <div class="flex items-baseline flex-1 min-w-[100px] mx-1">
                                    <span class="text-slate-400 font-medium mr-1.5 text-[10px]">No:</span>
                                    <span class="border-b border-slate-300 text-slate-800 flex-1 text-center font-semibold">${txtRef}</span>
                                </div>
                                <div class="flex items-baseline flex-1 min-w-[100px] mx-1">
                                    <span class="text-slate-400 font-medium mr-1.5 text-[10px]">Bank:</span>
                                    <span class="border-b border-slate-300 text-slate-800 flex-1 text-center font-semibold">${txtBank}</span>
                                </div>
                                <div class="flex items-baseline flex-1 min-w-[90px] ml-1">
                                    <span class="text-slate-400 font-medium mr-1.5 text-[10px]">Dated:</span>
                                    <span class="border-b border-slate-300 text-slate-800 flex-1 text-center font-semibold">${targetFormattedDate}</span>
                                </div>
                            </div>

                            <div class="flex items-baseline w-full pt-1">
                                <span class="text-slate-500 font-medium whitespace-nowrap mr-2">For Payment of:</span>
                                <span class="receipt-underline text-slate-800 px-2 flex-1 font-semibold">${rowData.purpose}</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6">
                        <div class="flex justify-between items-end relative">
                            <div class="flex items-center space-x-3">
                                <span class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Amount</span>
                                <div class="border-2 border-blue-900 rounded-lg px-4 py-1.5 bg-slate-50 font-mono font-black text-base text-blue-900 min-w-[140px] text-center shadow-sm">
                                    <span>TK </span><span>${displayAmt}</span>
                                </div>
                            </div>
                            
                            <div class="flex space-x-12 text-center text-[10px] font-semibold text-slate-500 relative z-10">
                                <div class="w-28 border-t border-slate-300 pt-1.5">Customer Signature</div>
                                <div class="w-32 border-t border-slate-300 pt-1.5 font-bold text-slate-800">
                                    Authorised Signature
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CUT LINE DIVISION ROW -->
                <div class="relative w-full border-b border-dashed border-slate-300 my-1 flex justify-center items-center no-print select-none">
                    <span class="absolute bg-white px-4 py-0.5 border border-slate-200 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center shadow-sm">
                        <i data-lucide="scissors" class="w-3 h-3 mr-1.5 text-slate-400"></i> Cut Matrix Alignment Axis
                    </span>
                </div>

                <!-- OFFICE COPY CONTAINER -->
                <div class="receipt-box bg-white p-5 flex flex-col justify-between border border-slate-200 rounded-xl relative min-h-[440px]">
                    <div class="absolute top-4 right-4 bg-slate-50 border border-slate-200/60 text-slate-400 text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase select-none no-print">
                        Office Copy Replica
                    </div>
                    <div>
                        <div class="flex items-center space-x-4 border-b-2 border-slate-100 pb-3">
                            <div class="w-24 h-24 shrink-0 flex items-center justify-center bg-slate-50/50 rounded-lg overflow-hidden border border-slate-100">
                                <img class="object-contain max-w-full max-h-full" src="${corporateLogoDataUri}">
                            </div>
                            <div class="flex-1">
                                <h2 class="text-xl tracking-tight leading-none uppercase font-normal text-blue-900">
                                    <span class="font-broadway font-bold text-black mr-1.5">SANAA</span>
                                    <span class="tracking-tight">GLOBAL LTD.</span>
                                </h2>
                                <p class="text-[10px] text-slate-600 font-semibold mt-1.5 leading-snug">Plot # 05, Road # 05, Block # A, Section # 06, Mirpur, Dhaka 1216</p>
                                <p class="text-[9px] text-slate-500 font-medium mt-0.5">Phone: 01898923110, Email: sanaagloballtd@gmail.com</p>
                            </div>
                        </div>

                        <div class="text-center my-3">
                            <span class="text-xs font-black tracking-widest text-slate-900 border-b-2 border-slate-900 pb-0.5 uppercase inline-block italic">MONEY RECEIPT</span>
                        </div>

                        <div class="space-y-4 text-xs text-slate-900 font-bold">
                            <div class="flex justify-between items-end">
                                <div class="flex flex-1 max-w-[55%] items-baseline">
                                    <span class="text-slate-500 font-medium whitespace-nowrap mr-2">Receipt No:</span>
                                    <span class="receipt-underline font-mono font-extrabold text-blue-600 px-2 flex-1">${rowData.receiptNo}</span>
                                </div>
                                <div class="flex flex-1 max-w-[40%] items-baseline">
                                    <span class="text-slate-500 font-medium whitespace-nowrap mr-2">Date:</span>
                                    <span class="receipt-underline px-2 flex-1 font-semibold text-slate-800">${targetFormattedDate}</span>
                                </div>
                            </div>

                            <div class="flex items-baseline w-full">
                                <span class="text-slate-500 font-medium whitespace-nowrap mr-2">Received with thanks from:</span>
                                <span class="receipt-underline font-semibold text-slate-800 px-2 flex-1">${rowData.sender}</span>
                            </div>

                            <div class="flex items-baseline w-full">
                                <span class="text-slate-500 font-medium whitespace-nowrap mr-2">Amount of:</span>
                                <span class="receipt-underline text-slate-700 px-2 flex-1 italic font-medium">${txtWords}</span>
                            </div>

                            <div class="flex flex-wrap items-center gap-y-3 pt-1 text-[11px] font-bold text-slate-800 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60">
                                <div class="flex items-center mr-4">
                                    <span class="text-slate-500 font-medium mr-2">By Cash</span>
                                    <span class="w-4 h-4 border border-slate-400 text-center text-[10px] leading-4 font-black rounded bg-white inline-block text-blue-600">${rowData.method === 'Cash' ? '✓' : ''}</span>
                                </div>
                                <div class="flex items-center mr-4">
                                    <span class="text-slate-500 font-medium mr-2">/ Online Transfer</span>
                                    <span class="w-4 h-4 border border-slate-400 text-center text-[10px] leading-4 font-black rounded bg-white inline-block text-blue-600">${rowData.method === 'Online Line Transfer' ? '✓' : ''}</span>
                                </div>
                                <div class="flex items-center mr-4">
                                    <span class="text-slate-500 font-medium mr-2">/ Cheque</span>
                                    <span class="w-4 h-4 border border-slate-400 text-center text-[10px] leading-4 font-black rounded bg-white inline-block text-blue-600">${rowData.method === 'Cheque' ? '✓' : ''}</span>
                                </div>
                                <div class="flex items-baseline flex-1 min-w-[100px] mx-1">
                                    <span class="text-slate-400 font-medium mr-1.5 text-[10px]">No:</span>
                                    <span class="border-b border-slate-300 text-slate-800 flex-1 text-center font-semibold">${txtRef}</span>
                                </div>
                                <div class="flex items-baseline flex-1 min-w-[100px] mx-1">
                                    <span class="text-slate-400 font-medium mr-1.5 text-[10px]">Bank:</span>
                                    <span class="border-b border-slate-300 text-slate-800 flex-1 text-center font-semibold">${txtBank}</span>
                                </div>
                                <div class="flex items-baseline flex-1 min-w-[90px] ml-1">
                                    <span class="text-slate-400 font-medium mr-1.5 text-[10px]">Dated:</span>
                                    <span class="border-b border-slate-300 text-slate-800 flex-1 text-center font-semibold">${targetFormattedDate}</span>
                                </div>
                            </div>

                            <div class="flex items-baseline w-full pt-1">
                                <span class="text-slate-500 font-medium whitespace-nowrap mr-2">For Payment of:</span>
                                <span class="receipt-underline text-slate-800 px-2 flex-1 font-semibold">${rowData.purpose}</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 relative">
                        <div class="flex justify-between items-end relative">
                            <div class="flex items-center space-x-3">
                                <span class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Amount</span>
                                <div class="border-2 border-blue-900 rounded-lg px-4 py-1.5 bg-slate-50 font-mono font-black text-base text-blue-900 min-w-[140px] text-center shadow-sm">
                                    <span>TK </span><span>${displayAmt}</span>
                                </div>
                            </div>
                            
                            <div class="flex space-x-12 text-center text-[10px] font-semibold text-slate-500 relative z-10">
                                <div class="w-28 border-t border-slate-300 pt-1.5">Customer Signature</div>
                                <div class="relative w-32">
                                    <div class="absolute bottom-[17px] right-[-10px] text-[15px] font-black tracking-widest text-purple-600/20 uppercase select-none transform rotate-[-12deg] whitespace-nowrap pointer-events-none font-sans">
                                        SANAA GLOBAL LTD.
                                    </div>
                                    <div class="w-full border-t border-slate-300 pt-1.5 font-bold text-slate-800">
                                        Authorised Signature
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('modalPrintCaptureArea').innerHTML = multiCopyStructuralHtmlTemplate;
            const modalNode = document.getElementById('viewModal');
            modalNode.classList.remove('hidden');
            modalNode.classList.add('flex');
            window.lucide?.createIcons?.();
        }

        function closeReceiptPreviewModal() {
            const modalNode = document.getElementById('viewModal');
            modalNode.classList.add('hidden');
            modalNode.classList.remove('flex');
        }

        function printModalSpecificDocument() {
            document.body.classList.add('modal-printing');
            window.print();
            setTimeout(() => {
                document.body.classList.remove('modal-printing');
            }, 500);
        }

        function clearWorkspaceInputBlocks() {
            document.getElementById('inpSender').value = '';
            document.getElementById('inpWords').value = '';
            document.getElementById('inpBank').value = '';
            document.getElementById('inpRef').value = '';
            document.getElementById('inpPurpose').value = '';
            document.getElementById('inpAmount').value = '';
            document.getElementById('inpMethod').value = 'Cash';

            const dynamicResetDayText = new Date().toISOString().split('T')[0];
            document.getElementById('inpDate').value = dynamicResetDayText;

            sessionStorage.removeItem('sanaa_workspace_snapshot');
            localStorage.removeItem('sanaa_workspace_snapshot');
            runCalculationEngineSequence();
            toggleInstrumentGateways();
        }

        function clearWorkspaceInputBlocksWithoutResettingSequence(nextSuggestedSequenceNumber) {
            document.getElementById('inpSender').value = '';
            document.getElementById('inpWords').value = '';
            document.getElementById('inpBank').value = '';
            document.getElementById('inpRef').value = '';
            document.getElementById('inpPurpose').value = '';
            document.getElementById('inpAmount').value = '';
            document.getElementById('inpMethod').value = 'Cash';

            document.getElementById('inpReceiptNo').value = nextSuggestedSequenceNumber;

            sessionStorage.removeItem('sanaa_workspace_snapshot');
            localStorage.removeItem('sanaa_workspace_snapshot');
            writeStateSnapshotToCache();
            toggleInstrumentGateways();
        }

        function persistTerminalProgress() {
            writeStateSnapshotToCache();
            localStorage.setItem('sanaa_receipts', JSON.stringify(globalDatabaseCollection));
        }

        function exitTerminal() {
            const confirmation = confirm('Save current progress and exit the terminal?');
            if (!confirmation) return;

            persistTerminalProgress();

            // Platform-specific close attempts for Cordova, Electron, and browser environments.
            if (window.cordova && navigator.app && typeof navigator.app.exitApp === 'function') {
                navigator.app.exitApp();
                return;
            }
            if (window.cordova && navigator.device && typeof navigator.device.exitApp === 'function') {
                navigator.device.exitApp();
                return;
            }
            if (typeof window.chrome === 'object' && typeof window.chrome.webview === 'object' && typeof window.chrome.webview.postMessage === 'function') {
                try {
                    window.chrome.webview.postMessage('exitApp');
                } catch (_error) {
                    // Ignore and continue to browser fallback.
                }
            }

            window.open('', '_self').close();

            setTimeout(() => {
                if (!window.closed) {
                    window.location.href = 'about:blank';
                }
            }, 150);
        }






