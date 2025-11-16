 // --- 1. MOCK DATA (Updated to reflect specific percentages) ---
        const attendanceData = [
            // Subject 1: ~90.4% (Green Ring) - User requested 91%
            { id: 'IXD801', name: 'INTERACTION DESIGN (OM)', faculty: 'Shreya Singh', attended: 19, delivered: 21, dutyLeaves: 0, bonusAtt: 0, section: 'K0132' }, 
            // Subject 2: 40% (Red Ring)
            { id: 'PEAS05', name: 'ANALYTICAL - V (PE)', faculty: 'Manpreet Kaur', attended: 4, delivered: 10, dutyLeaves: 2, bonusAtt: 0, section: '9R884' }, 
            // Subject 3: ~73.3% (Yellow Ring) - User requested 73%
            { id: 'PEV301', name: 'VERBAL ABILITY (PW)', faculty: 'Poonam Tarpial', attended: 11, delivered: 15, dutyLeaves: 0, bonusAtt: 0, section: '38-512-C1' },
            // Subject 4: 85% (Green Ring)
            { id: 'BT101', name: 'BASIC PYTHON PROGRAMMING', faculty: 'Dr. A. Sharma', attended: 17, delivered: 20, dutyLeaves: 1, bonusAtt: 0, section: 'L102A' },
            // Subject 5: 100% (Green Ring)
            { id: 'CS102', name: 'DATA STRUCTURES', faculty: 'J. Kaur', attended: 15, delivered: 15, dutyLeaves: 0, bonusAtt: 0, section: 'B0011' },
        ];

        let currentGoal = 75; // Default goal

        // --- NEW: Color Logic based on thresholds ---
        function getAttendanceColor(percentage) {
            // Note: Thresholds are set at >=75% for high, >=50% for mid, otherwise low
            if (percentage >= 75) {
                return 'var(--color-green)'; // High attendance (Green)
            } else if (percentage >= 50) {
                return 'var(--color-yellow)'; // Mid/Critical attendance (Yellow)
            } else {
                return 'var(--color-red)'; // Low/Danger attendance (Red)
            }
        }
        
        // --- 2. CALCULATOR LOGIC (No changes needed here) ---
        function calculateRequiredLectures(subject, goal) {
            const A = subject.attended; // Attended
            const D = subject.delivered; // Delivered
            const G = goal; // Goal percentage

            const effectiveAttended = A + subject.bonusAtt;
            const currentPercentage = (effectiveAttended / D) * 100;
            
            if (currentPercentage >= G) {
                return { 
                    status: 'achieved', 
                    current: currentPercentage.toFixed(1),
                    needed: 0
                };
            }

            // Calculation: N >= (G * D - 100 * A) / (100 - G)
            let required_N = (G * D - 100 * effectiveAttended) / (100 - G);
            
            // If G is 100, the formula changes to simple difference
            if (G === 100) {
                required_N = D - effectiveAttended;
            }

            // We need the smallest whole number of classes to attend
            const lecturesNeeded = Math.ceil(required_N);

            return { 
                status: 'pending', 
                current: currentPercentage.toFixed(1),
                needed: Math.max(0, lecturesNeeded) // Ensure it's not negative
            };
        }

        // --- 3. UI RENDERING (Uses the gradient and ring styles) ---
        function renderAttendanceList() {
            const listContainer = document.getElementById('attendance-list');
            listContainer.innerHTML = ''; // Clear previous list

            // Constants for the SVG ring
            const radius = 35;
            const circumference = 2 * Math.PI * radius;
            const size = 80;

            attendanceData.forEach(subject => {
                // Calculation uses effective attended (attended + bonusAtt)
                const effectiveAttended = subject.attended + subject.bonusAtt;
                const currentAtt = (effectiveAttended / subject.delivered * 100).toFixed(0);
                const progressPercentage = Math.min(100, currentAtt);
                
                // Calculate dash offset for the ring
                const offset = circumference - (progressPercentage / 100) * circumference;
                
                // Get the color based on the percentage
                const ringColor = getAttendanceColor(parseFloat(currentAtt));

                const card = document.createElement('div');
                
                // Note: Added the 'group-gradient' class to the Group badge for LPU style
                card.className = 'subject-card bg-white p-4 rounded-xl flex justify-between items-start';
                card.innerHTML = `
                    <!-- Text Content Area: Added min-w-0 for responsiveness -->
                    <div class="flex-grow space-y-1 min-w-0">
                        <!-- UPDATED: Added flex-wrap and gap-x-2. Removed justify-between. 
                             This allows the badge to drop to the next line if the title is too long. -->
                        <div class="flex flex-wrap items-start gap-x-2">
                            <!-- Title: Removed flex-grow and pr-2. The title will naturally wrap. -->
                            <h2 class="text-base font-bold text-gray-800">${subject.id} - ${subject.name}</h2>
                            <!-- Group Badge: Always fixed width, will wrap below title if necessary -->
                            <div class="group-gradient text-xs font-bold text-white px-2 py-1 rounded-md shadow-sm flex-shrink-0">Group: 1</div>
                        </div>
                        <p class="text-xs text-gray-500">Faculty: ${subject.faculty}</p>
                        <p class="text-sm">Attended/Delivered: <span class="font-semibold">${subject.attended}/${subject.delivered}</span></p>
                        <p class="text-sm text-gray-600">Duty Leaves: ${subject.dutyLeaves}</p>
                        <div class="flex justify-between mt-2 pt-2 border-t border-gray-100">
                            <span class="text-xs font-medium text-indigo-500">Section: ${subject.section}</span>
                        </div>
                    </div>
                    
                    <!-- Circular Progress Ring (SVG) -->
                    <div class="ml-4 flex-shrink-0 relative">
                        <div class="progress-ring-container">
                            <svg width="${size}" height="${size}">
                                <!-- Background Circle -->
                                <circle class="progress-ring-background" cx="${size/2}" cy="${size/2}" r="${radius}"></circle>
                                <!-- Progress Circle -->
                                <circle 
                                    class="progress-ring-circle" 
                                    stroke="${ringColor}" 
                                    cx="${size/2}" cy="${size/2}" r="${radius}" 
                                    stroke-dasharray="${circumference} ${circumference}" 
                                    style="stroke-dashoffset: ${offset};"
                                ></circle>
                            </svg>
                            <span class="progress-ring-text">${currentAtt}%</span>
                        </div>
                        
                        <!-- Info Icon placed near the progress ring -->
                        <button class="i-icon absolute -right-2 -top-2 text-gray-400 hover:text-indigo-600 transition-colors p-1" onclick="showInsights('${subject.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        </button>
                    </div>
                `;
                listContainer.appendChild(card);
            });
        }

        // --- 4. GOAL SETTING & HANDLER (No changes needed here) ---
        function setGoal(goalValue) {
            currentGoal = parseInt(goalValue, 10);
            renderAttendanceList();
            console.log(`Attendance goal set to: ${currentGoal}%`);
        }

        // --- 5. MODAL LOGIC (Uses the same color logic) ---
        function showInsights(subjectId) {
            const subject = attendanceData.find(s => s.id === subjectId);
            if (!subject) return;

            const calculation = calculateRequiredLectures(subject, currentGoal);
            
            const modalSubjectName = document.getElementById('modal-subject-name');
            const modalContent = document.getElementById('modal-content');
            const infoModal = document.getElementById('info-modal');

            modalSubjectName.textContent = `${subject.id} - Goal Insights`;

            let contentHTML = '';
            const currentAtt = parseFloat(calculation.current);
            const statusColor = getAttendanceColor(currentAtt);

            if (calculation.status === 'achieved') {
                contentHTML = `
                    <div class="text-center py-4 bg-green-50 rounded-lg border border-green-200">
                        <p class="text-3xl mb-2">🎉</p>
                        <p class="text-lg font-bold text-green-700">Goal Achieved!</p>
                        <p class="text-sm text-gray-600">Your current effective attendance is <span style="color: ${statusColor};" class="font-bold">${calculation.current}%</span> against the ${currentGoal}% goal.</p>
                    </div>
                `;
            } else {
                // Warning color logic for lectures needed
                const neededColor = currentAtt < 50 ? 'var(--color-red)' : 'var(--color-yellow)';

                contentHTML = `
                    <div class="p-3 bg-indigo-50 rounded-lg">
                        <p class="text-base font-semibold text-gray-800">Target Goal: <span class="text-indigo-600">${currentGoal}%</span></p>
                        <p class="text-base font-semibold text-gray-800">Current Effective Att.: <span style="color: ${statusColor};" class="font-bold">${calculation.current}%</span></p>
                    </div>
                    <div class="border-y py-3 my-2">
                        <p class="text-xl font-bold" style="color: ${neededColor};">
                            Attend <span class="text-3xl">${calculation.needed}</span> more lectures
                        </p>
                        <p class="text-sm text-gray-500">consecutively to reach the ${currentGoal}% goal.</p>
                    </div>
                `;
            }

            contentHTML += `
                <h4 class="font-bold mt-4 text-indigo-600">Backup and Bonus</h4>
                <p class="text-sm">
                    <span class="font-semibold">Duty Leaves Backup:</span> 
                    ${subject.dutyLeaves} available.
                </p>
                <p class="text-sm">
                    <span class="font-semibold">Attendance Bonus (Pending Update):</span> 
                    +${subject.bonusAtt} lecture${subject.bonusAtt !== 1 ? 's' : ''} added to your attended count for calculation.
                </p>
            `;

            modalContent.innerHTML = contentHTML;
            infoModal.classList.remove('hidden');
            infoModal.classList.add('flex');
        }

        function closeModal(event) {
            if (event.target.id === 'info-modal') {
                document.getElementById('info-modal').classList.add('hidden');
            }
        }


        // --- 6. INITIALIZATION ---
        window.onload = () => {
            // Set the initial goal and render the list
            const initialGoal = document.getElementById('goal-select').value;
            setGoal(initialGoal);
        };
