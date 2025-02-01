let conditions =
    [
        // アーティスト
        'ミセス',
        'ヨルシカ',
        '髭男',
        'まふまふ',
        // ジャンル
        'JPOP',
        'ボカロ',
        'アニソン',
        'Vtuber',
        '平成ソング',
        '合唱',
        // 最高音
        'hiA~C',
        'hiC#~E',
        'hiF~G#',
        'hihi域'
    ];

window.addEventListener('DOMContentLoaded', function () {
    const deleteButtons = document.querySelectorAll('.delete');

    for (let i = 0; i < deleteButtons.length; i++) {
        // 参加者の削除ボタンが押されたときの処理
        deleteButtons[i].addEventListener('click', function (e) {
            const numberOfButtons = document.querySelectorAll('.delete').length;
            if (numberOfButtons !== 1) {
                e.target.parentElement.remove();
            }
        });
    }

    const plusButton = document.getElementById('plus');

    // 参加者追加ボタンが押されたときの処理
    plusButton.addEventListener('click', function (e) {
        e.target.remove();

        const participantsTd = document.getElementById('participants');

        const div = document.querySelector('#participants div').cloneNode(true);

        div.querySelector('.participant').value = '';
        const button = div.querySelector('.delete');
        button.addEventListener('click', function (e) {
            const numberOfButtons = document.querySelectorAll('.delete').length;
            if (numberOfButtons !== 1) {
                e.target.parentElement.remove();
            }
        });

        participantsTd.append(div);
        participantsTd.append(e.target);
    })

    const createButton = document.getElementById('create-button');

    // 生成ボタンが押されたときの処理
    createButton.addEventListener('click', function () {
        if (!confirm('ビンゴシートを生成しますか？')) {
            return;
        }

        const size = parseInt(document.getElementById('size').value);

        const rangeMin = parseInt(document.getElementById('range-min').value);

        const rangeMax = parseInt(document.getElementById('range-max').value);

        const duplicateValue = document.querySelector('input[name="duplicate-column"]:checked').value;
        let permitDuplicate = true;
        if (duplicateValue === 'no-duplicate') {
            permitDuplicate = false;
        }

        const participantsElements = document.querySelectorAll('.participant');
        const participants = Array.from(participantsElements).map(participantsElements => participantsElements.value.trim());

        // 入力値チェック
        if (size < 1 || size > 10 || isNaN(size)) {
            alert('サイズが不正です。');
            return;
        }
        if (rangeMin < 0 || rangeMin > 100 || isNaN(rangeMin)) {
            alert('点数の下限値が不正です。');
            return;
        }
        if (rangeMax < 0 || rangeMax > 100 || isNaN(rangeMax)) {
            alert('点数の上限値が不正です。');
            return;
        }
        if (rangeMin > rangeMax) {
            alert('点数の範囲が不正です。');
            return;
        }
        if (rangeMax - rangeMin + 1 < size * size && permitDuplicate === false) {
            alert('設定した点数の範囲では、埋めれないセルがあります。');
            return;
        }
        if (participants.includes('')) {
            alert('参加者を設定してください。');
            return;
        }

        // ビンゴシート生成
        const table = document.getElementById('bingo');
        createBingoSheet(table, size, rangeMin, rangeMax, permitDuplicate, participants);

    });

    /**
     * ビンゴシートを生成する関数
     * @param {*} table 作成するビンゴシートのHTML要素
     * @param {*} size ビンゴシートの大きさ
     * @param {*} min シートの値の下限値
     * @param {*} max シートの値の上限値
     * @param {*} permitDuplicate 重複を許すか(true/false)
     * @param {*} participants 参加者の名前が入った配列
     */
    function createBingoSheet(table, size, min, max, permitDuplicate, participants) {
        // ビンゴシートの各マスがあけられているかを表す配列を用意
        // 0→あいてない　1→あいてる
        const bingoArr = new Array(size);
        for (let i = 0; i < size; i++) {
            // 初期値はすべて0
            bingoArr[i] = new Array(size).fill(0);
        }

        // 既存のシートを削除
        for (let i = table.children.length - 1; i >= 0; i--) {
            table.children[i].remove();
        }

        // シートに入れる値を配列で受け取る
        const randomNumbers = createRandomArray(size, min, max, permitDuplicate);
        // イテレータ作成
        const randomNumbersIterator = randomNumbers[Symbol.iterator]();

        // 指定されたサイズのビンゴシートを生成 
        for (let i = 0; i < size; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < size; j++) {
                const td = document.createElement('td');

                const div = document.createElement('div');
                div.className = 'cell-content';

                // 数字部分
                const score = document.createElement('span');
                score.className = 'score';
                score.innerText = randomNumbersIterator.next().value;
                div.append(score);

                const condition = document.createElement('span');
                condition.className = 'condition';
                condition.innerText = conditions[randomNum(0, conditions.length - 1)];
                div.append(condition);

                // あけた名前入力部分を作成
                const participantsSelect = createParticipantsSelect(participants, i, j, bingoArr);
                div.append(participantsSelect);

                td.append(div);
                tr.append(td);
            }
            table.append(tr);
        }
    }

    /**
     * ビンゴシートの大きさ分の乱数を生成し、配列で返す関数
     * @param {*} size ビンゴシートのサイズ 
     * @param {*} min 乱数の下限値
     * @param {*} max 乱数の上限値
     * @param {*} permitDuplicate 重複を許可するか(true/false)
     * @returns ビンゴシートに入れる値を格納した配列
     */
    function createRandomArray(size, min, max, permitDuplicate) {
        if (permitDuplicate) {
            const randomArray = new Array();

            while (randomArray.length < size * size) {
                const num = randomNum(min, max);
                randomArray.push(num);
            }

            return randomArray;
        }

        const randomSet = new Set();

        while (randomSet.size < size * size) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            randomSet.add(num);
        }

        return Array.from(randomSet);
    }

    /**
     * 決められた範囲内の乱数を生成する関数
     * @param {*} min 最小値
     * @param {*} max 最大値
     * @returns 乱数
     */
    function randomNum(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**     
     * あけた人の名前入力部分をプルダウンリストで作成する関数
     * @param {*} participants 参加者の名前が入った配列
     * @param {*} i 現在作っているマスの縦の位置
     * @param {*} j 現在作っているマスの横の位置
     * @param {*} bingoArr ビンゴシートの各マスがあけられているかを表す配列
     * @returns あけた人の名前入力を選択するプルダウンリスト
     */
    function createParticipantsSelect(participants, i, j, bingoArr) {
        // あけた人の名前入力部分
        const participantsSelect = document.createElement('select');
        participantsSelect.class = 'participants-select';

        const option = document.createElement('option');
        option.value = '';

        participantsSelect.append(option);

        for (let i = 0; i < participants.length; i++) {
            const option = document.createElement('option');
            option.innerText = participants[i];
            option.value = i;
            participantsSelect.append(option);
        }

        // 名前が入力されたらあいたと判定し、背景色を変更
        participantsSelect.addEventListener('change', function (e) {
            const input = e.target.value.trim();

            if (input !== '') {
                e.target.parentElement.parentElement.style.backgroundColor = '#F0B9B9';
                bingoArr[i][j] = 1;

                isCompleteBingo = checkBingo(bingoArr, i, j);

                if (isCompleteBingo) {
                    const overlay = document.getElementById("overlay");
                    overlay.classList.add("show");

                    // 5秒後にフェードアウト
                    setTimeout(() => {
                        overlay.classList.remove("show");
                    }, 5000);
                }
            } else {
                e.target.parentElement.parentElement.style.backgroundColor = '#f8f9fa';
                bingoArr[i][j] = 0;
            }
        });

        return participantsSelect;
    }

    /**
     * ビンゴがそろっているかチェックする配列
     * @param {*} bingoArr ビンゴシートの各マスがあけられているかを表す配列
     * @param {*} y あけられたマスの縦の位置
     * @param {*} x あけられたマスの横の位置
     * @returns ビンゴがそろっているか(true/false)
     */
    function checkBingo(bingoArr, y, x) {
        const size = bingoArr[0].length;

        // 横チェック
        if (bingoArr[y].every(val => val === 1)) {
            return true;
        }

        // 縦チェック
        let flag = true;
        for (let i = 0; i < size; i++) {
            if (bingoArr[i][x] === 0) {
                flag = false;
                break;
            }
        }
        if (flag) {
            return true;
        }

        // 斜めチェック1
        if (y === x) {
            for (let i = 0, j = 0; i < size && j < size; i++, j++) {
                if (bingoArr[i][j] === 0) {
                    return false;
                }
            }
            return true;
        }

        // 斜めチェック2
        if (y === size - x - 1) {
            for (let i = 0, j = size - 1; i < size && j >= 0; i++, j--) {
                if (bingoArr[i][j] === 0) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }
});