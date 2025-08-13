document.addEventListener('DOMContentLoaded', () => {
    // ==================== ДЕКОДИРОВАНИЕ СЛОВА ИЗ ССЫЛКИ ====================
    function decodeWord(encoded) {
        try {
            return decodeURIComponent(atob(decodeURIComponent(encoded)));
        } catch {
            return null;
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const encodedWord = urlParams.get('w');
    
    if (!encodedWord) {
        alert('Не найдено загаданное слово в ссылке!');
        window.location.href = 'index.html';
        return;
    }
    
    const targetWord = decodeWord(encodedWord);
    
    if (!targetWord || !/^[а-яё]{1,13}$/.test(targetWord)) {
        alert('Некорректное слово в ссылке!');
        window.location.href = 'index.html';
        return;
    }

    // ==================== ОСНОВНАЯ ЛОГИКА ИГРЫ ====================
    const wordLength = targetWord.length;
    let currentGuess = '';
    let guesses = [];
    const maxGuesses = 6;
    
    const gameBoard = document.getElementById('game-board');
    const keyboard = document.getElementById('keyboard');
    const messageEl = document.getElementById('message');
    const container = document.querySelector('.game-container');
    
    const keyboardLayout = [
        ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
        ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
        ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '⌫'],
        ['Enter']
    ];
    
    // Инициализация игрового поля
    function initBoard() {
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < maxGuesses; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            
            for (let j = 0; j < wordLength; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.state = 'empty';
                row.appendChild(tile);
            }
            
            gameBoard.appendChild(row);
        }
    }
    
    // Создание клавиатуры
    function initKeyboard() {
        keyboard.innerHTML = '';
        
        keyboardLayout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.className = 'key';
                keyButton.textContent = key;
                
                if (key === 'Enter' || key === '⌫') {
                    keyButton.classList.add('wide');
                }
                
                keyButton.addEventListener('click', () => handleKeyPress(key));
                rowDiv.appendChild(keyButton);
            });
            
            keyboard.appendChild(rowDiv);
        });
    }
    
    // Обновление доски
    function updateBoard() {
        const currentRow = gameBoard.children[guesses.length];
        const tiles = currentRow.children;
        
        for (let i = 0; i < wordLength; i++) {
            const tile = tiles[i];
            if (i < currentGuess.length) {
                tile.textContent = currentGuess[i];
                tile.dataset.state = 'tbd'; // Временное состояние
            } else {
                tile.textContent = '';
                tile.dataset.state = 'empty';
            }
        }
    }
    
    // Обработка нажатий
    function handleKeyPress(key) {
        if (key === 'Enter') {
            submitGuess();
        } else if (key === '⌫') {
            deleteLetter();
        } else if (/^[а-яё]$/.test(key) && currentGuess.length < wordLength) {
            addLetter(key);
        }
    }
    
    function addLetter(letter) {
        currentGuess += letter;
        updateBoard();
        
        // Анимация добавления буквы
        const currentRow = gameBoard.children[guesses.length];
        const tile = currentRow.children[currentGuess.length - 1];
        tile.classList.add('tile-animation');
        setTimeout(() => tile.classList.remove('tile-animation'), 300);
    }
    
    function deleteLetter() {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            updateBoard();
        }
    }
    
    // Проверка слова
    function submitGuess() {
        if (currentGuess.length !== wordLength) {
            showMessage(`Нужно ${wordLength} букв!`);
            return;
        }
        
        if (!/^[а-яё]+$/.test(currentGuess)) {
            showMessage('Только русские буквы!');
            return;
        }
        
        guesses.push(currentGuess);
        processGuess(currentGuess);
        
        if (currentGuess === targetWord) {
            showMessage(`Ура! Угадано за ${guesses.length} попыток`);
            celebrateVictory();
            disableInput();
            return;
        }
        
        if (guesses.length === maxGuesses) {
            showMessage(`Игра окончена! Слово: ${targetWord}`);
            disableInput();
            return;
        }
        
        currentGuess = '';
    }
    
    // Обработка результатов
    function processGuess(guess) {
        const currentRow = gameBoard.children[guesses.length - 1];
        const tiles = currentRow.children;
        const targetLetters = targetWord.split('');
        const guessLetters = guess.split('');
        
        // 1. Проверка точных совпадений (зеленые)
        for (let i = 0; i < wordLength; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                tiles[i].dataset.state = 'correct';
                targetLetters[i] = null;
            }
        }
        
        // 2. Проверка частичных совпадений (желтые)
        for (let i = 0; i < wordLength; i++) {
            if (tiles[i].dataset.state === 'correct') continue;
            
            const indexInTarget = targetLetters.indexOf(guessLetters[i]);
            if (indexInTarget !== -1) {
                tiles[i].dataset.state = 'present';
                targetLetters[indexInTarget] = null;
            } else {
                tiles[i].dataset.state = 'absent';
            }
            
            // Анимация плитки
            setTimeout(() => {
                tiles[i].classList.add('tile-animation');
                setTimeout(() => tiles[i].classList.remove('tile-animation'), 300);
            }, i * 100);
        }
        
        updateKeyboard();
    }
    
    // Обновление клавиатуры
    function updateKeyboard() {
        document.querySelectorAll('.key').forEach(button => {
            const letter = button.textContent.toLowerCase();
            if (letter === 'enter' || letter === '⌫') return;
            
            for (const guess of guesses) {
                if (guess.includes(letter)) {
                    if (targetWord.includes(letter)) {
                        button.dataset.state = 
                            targetWord[guess.indexOf(letter)] === letter ? 'correct' : 'present';
                    } else {
                        button.dataset.state = 'absent';
                    }
                    break;
                }
            }
        });
    }
    
    // Вспомогательные функции
    function showMessage(msg) {
        messageEl.textContent = msg;
    }
    
    function disableInput() {
        currentGuess = '';
    }
    
    function celebrateVictory() {
        container.classList.add('victory-animation');
        createConfetti();
    }
    
    function createConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            container.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    }
    
    // Обработка физической клавиатуры
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleKeyPress('Enter');
        else if (e.key === 'Backspace') handleKeyPress('⌫');
        else if (/^[а-яё]$/i.test(e.key)) handleKeyPress(e.key.toLowerCase());
    });
    
    // Запуск игры
    initBoard();
    initKeyboard();
});