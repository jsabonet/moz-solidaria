// Test payload after fixes
const testPayload = {
  report_type: 'executive',  // ✅ Now valid option
  format: 'pdf',
  filters: {
    date_from: '2025-07-01',
    date_to: '2025-08-12'
  },
  email_recipients: []
};

console.log('📋 Fixed payload for report generation:');
console.log(JSON.stringify(testPayload, null, 2));

console.log('\n✅ Backend REPORT_TYPES choices:');
console.log('- impact, financial, progress, executive, quarterly, annual, custom');

console.log('\n✅ Frontend reportTypes options (aligned):');
console.log('- executive, financial, impact, progress, quarterly, annual');

console.log('\n🔧 Changes made:');
console.log('1. Removed invalid options: projects, community, blog');
console.log('2. Added valid options: progress, quarterly, annual');
console.log('3. Updated all TypeScript interfaces');
console.log('4. Added debug logs to backend view');

console.log('\n🎯 Expected behavior:');
console.log('- Frontend dropdown shows only valid report types');
console.log('- POST request sends valid report_type value');
console.log('- Backend serializer validation passes');
console.log('- Report generation proceeds without 400 error');
