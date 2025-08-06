
// Atualizar tokens no localStorage
console.log('Atualizando tokens...');
localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU0NDQ3MzQ4LCJpYXQiOjE3NTQ0NDM3NDgsImp0aSI6ImY1N2YzZmQwZWZkNDRhZTU4NzNkNWUwYzAzY2Y0Yzc5IiwidXNlcl9pZCI6MX0._BlM9uo63MPzeUgYDaErlbn1GSnVqQvRNcmg2E_e4PI');
localStorage.setItem('refreshToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1NTA0ODU0OCwiaWF0IjoxNzU0NDQzNzQ4LCJqdGkiOiI3MDhiMDcwNjRiYjg0NGUzYTgyMDRiMzQyOGZjYWM4NiIsInVzZXJfaWQiOjF9.yiTA08e_OV0laesPicvQZ1nKS9XeadVSU-PtUPjsS4Q');
console.log('Tokens atualizados com sucesso!');
console.log('Token valido ate aproximadamente 1 hora');
alert('Tokens atualizados! Recarregue a pagina para aplicar as mudancas.');
