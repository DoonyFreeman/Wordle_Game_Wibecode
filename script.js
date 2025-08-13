document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('word-input');
    const createBtn = document.getElementById('create-game');
    const gameLink = document.getElementById('game-link');
    const linkOutput = document.getElementById('link-output');
    const copyBtn = document.getElementById('copy-link');

    // Шифруем слово для URL
    function encodeWord(word) {
        // Двойное кодирование для надежности
        return encodeURIComponent(btoa(encodeURIComponent(word)));
    }

    createBtn.addEventListener('click', () => {
        const word = wordInput.value.trim().toLowerCase();
        
        if (!/^[а-яё]{1,13}$/.test(word)) {
            alert('Слово должно содержать 1-13 русских букв!');
            return;
        }
        
        const encoded = encodeWord(word);
        const gameUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}game.html?w=${encoded}`;
        
        linkOutput.value = gameUrl;
        gameLink.classList.remove('hidden');
    });

    copyBtn.addEventListener('click', () => {
        linkOutput.select();
        document.execCommand('copy');
        alert('Ссылка скопирована! Отправьте её другу.');
    });
});