/* 20 team members. Referenced by projects (teamIds), tasks (assigneeId),
   activities (actorId). Keep ids stable: tm-001 … tm-020. */

export const teamMembers = [
  { id: 'tm-001', name: 'Amara Okafor', role: 'VP of Engineering', department: 'Engineering', email: 'amara.okafor@nexora.io', status: 'active', lastActive: hoursAgo(0.2), tasksCompleted: 184, productivity: 96 },
  { id: 'tm-002', name: 'Daniel Reyes', role: 'Senior Frontend Engineer', department: 'Engineering', email: 'daniel.reyes@nexora.io', status: 'active', lastActive: hoursAgo(0.5), tasksCompleted: 162, productivity: 93 },
  { id: 'tm-003', name: 'Priya Nair', role: 'Product Manager', department: 'Product', email: 'priya.nair@nexora.io', status: 'active', lastActive: hoursAgo(1), tasksCompleted: 141, productivity: 91 },
  { id: 'tm-004', name: 'Jonas Weber', role: 'Backend Engineer', department: 'Engineering', email: 'jonas.weber@nexora.io', status: 'active', lastActive: hoursAgo(0.3), tasksCompleted: 158, productivity: 89 },
  { id: 'tm-005', name: 'Sofia Marchetti', role: 'Senior UX Designer', department: 'Design', email: 'sofia.marchetti@nexora.io', status: 'active', lastActive: hoursAgo(2), tasksCompleted: 129, productivity: 92 },
  { id: 'tm-006', name: 'Liam Carter', role: 'Data Analyst', department: 'Analytics', email: 'liam.carter@nexora.io', status: 'active', lastActive: hoursAgo(3), tasksCompleted: 117, productivity: 87 },
  { id: 'tm-007', name: 'Yuki Tanaka', role: 'DevOps Engineer', department: 'Engineering', email: 'yuki.tanaka@nexora.io', status: 'away', lastActive: hoursAgo(7), tasksCompleted: 134, productivity: 90 },
  { id: 'tm-008', name: 'Fatima Al-Sayed', role: 'Customer Success Manager', department: 'Customer Success', email: 'fatima.alsayed@nexora.io', status: 'active', lastActive: hoursAgo(1.5), tasksCompleted: 149, productivity: 94 },
  { id: 'tm-009', name: 'Marcus Bell', role: 'Sales Lead', department: 'Sales', email: 'marcus.bell@nexora.io', status: 'active', lastActive: hoursAgo(0.8), tasksCompleted: 122, productivity: 88 },
  { id: 'tm-010', name: 'Elena Petrova', role: 'QA Engineer', department: 'Engineering', email: 'elena.petrova@nexora.io', status: 'active', lastActive: hoursAgo(2.5), tasksCompleted: 171, productivity: 95 },
  { id: 'tm-011', name: 'David Kim', role: 'Solutions Architect', department: 'Engineering', email: 'david.kim@nexora.io', status: 'active', lastActive: hoursAgo(4), tasksCompleted: 98, productivity: 86 },
  { id: 'tm-012', name: 'Aisha Bello', role: 'Marketing Manager', department: 'Marketing', email: 'aisha.bello@nexora.io', status: 'active', lastActive: hoursAgo(1.2), tasksCompleted: 113, productivity: 89 },
  { id: 'tm-013', name: 'Tom Becker', role: 'Finance Manager', department: 'Finance', email: 'tom.becker@nexora.io', status: 'away', lastActive: hoursAgo(9), tasksCompleted: 87, productivity: 84 },
  { id: 'tm-014', name: 'Grace Liu', role: 'Data Scientist', department: 'Analytics', email: 'grace.liu@nexora.io', status: 'active', lastActive: hoursAgo(0.6), tasksCompleted: 104, productivity: 92 },
  { id: 'tm-015', name: 'Omar Haddad', role: 'Support Specialist', department: 'Customer Success', email: 'omar.haddad@nexora.io', status: 'active', lastActive: hoursAgo(0.4), tasksCompleted: 196, productivity: 97 },
  { id: 'tm-016', name: 'Ingrid Larsen', role: 'HR Manager', department: 'People', email: 'ingrid.larsen@nexora.io', status: 'offline', lastActive: hoursAgo(26), tasksCompleted: 64, productivity: 81 },
  { id: 'tm-017', name: 'Carlos Mendez', role: 'Mobile Engineer', department: 'Engineering', email: 'carlos.mendez@nexora.io', status: 'active', lastActive: hoursAgo(1.8), tasksCompleted: 126, productivity: 90 },
  { id: 'tm-018', name: 'Nadia Rahman', role: 'Content Strategist', department: 'Marketing', email: 'nadia.rahman@nexora.io', status: 'active', lastActive: hoursAgo(3.5), tasksCompleted: 91, productivity: 85 },
  { id: 'tm-019', name: 'Peter Novak', role: 'Security Engineer', department: 'Engineering', email: 'peter.novak@nexora.io', status: 'away', lastActive: hoursAgo(6), tasksCompleted: 79, productivity: 88 },
  { id: 'tm-020', name: 'Hannah Kim', role: 'Operations Manager', department: 'Operations', email: 'hannah.kim@nexora.io', status: 'active', lastActive: hoursAgo(0.9), tasksCompleted: 138, productivity: 93 },
];

function hoursAgo(h) {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

export const teamById = Object.fromEntries(teamMembers.map((m) => [m.id, m]));

export const departments = [...new Set(teamMembers.map((m) => m.department))].sort();
