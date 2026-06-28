function checkAnswer() {
    const input = document.getElementById('answer');
    const errorMsg = document.getElementById('error');
    
    if (input.value === '8') {
        errorMsg.classList.add('hidden');
        document.getElementById('quiz-area').classList.add('hidden');
        document.getElementById('desc').classList.add('hidden');
        document.getElementById('link-area').classList.remove('hidden');

        const code = "GaNPpqv"; 
        window.location.href = "https://" + "discord." + "gg/" + code;
    } else {
        errorMsg.classList.remove('hidden');
        input.value = '';
        input.focus();
    }
}
document.getElementById('answer').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});