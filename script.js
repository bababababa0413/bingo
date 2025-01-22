window.addEventListener('DOMContentLoaded', function () {
    const deleteButtons = document.querySelectorAll('.delete');

    for(let i = 0; i < deleteButtons.length; i++){
        // 参加者の削除ボタンが押されたときの処理
        deleteButtons[i].addEventListener('click', function(e){
            const numberOfButtons = document.querySelectorAll('.delete').length;
            if(numberOfButtons !== 1){
                e.target.parentElement.remove();
            }
        });
    }

    const plusButton = document.getElementById('plus');

    // 参加者追加ボタンが押されたときの処理
    plusButton.addEventListener('click', function(e){
        e.target.remove();

        const participantsTd = document.getElementById('participants');

        const div = document.querySelector('#participants div').cloneNode(true);

        const button = div.querySelector('.delete');
        button.addEventListener('click', function(e) {
            const numberOfButtons = document.querySelectorAll('.delete').length;
            if(numberOfButtons !== 1){
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
        if (rangeMax - rangeMin + 1 < size * size) {
            alert('設定した点数の範囲では、埋めれないセルがあります。');
            return;
        }

        // ビンゴシート生成
        const table = document.getElementById('bingo');
        createBingoSheet(table, size, rangeMin, rangeMax);

    });

    /**
     * ビンゴシートを生成する関数
     * @param {*} table 作成するビンゴシートのHTML要素
     * @param {*} size ビンゴシートの大きさ
     * @param {*} min シートの値の下限値
     * @param {*} max シートの値の上限値
     */
    function createBingoSheet(table, size, min, max) {
        // 既存のシートを削除
        for (let i = table.children.length - 1; i >= 0; i--) {
            table.children[i].remove();
        }

        // シートに入れる値をSetで受け取る
        const randomSet = createRandomSet(size, min, max);
        const randomSetIterator = randomSet.values();

        // 指定されたサイズのビンゴシートを生成 
        for (let i = 0; i < size; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < size; j++) {
                const td = document.createElement('td');

                const div = document.createElement('div');
                div.className = 'cell-content';

                // 数字部分
                const span = document.createElement('span');
                span.innerText = randomSetIterator.next().value;
                div.append(span);

                // 空けた名前入力部分
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                // 名前が入力されたら空いたと判定し、背景色を変更
                nameInput.addEventListener('change', function (e) {
                    const input = e.target.value.trim();

                    if (input !== '') {
                        e.target.parentElement.parentElement.style.backgroundColor = '#F0B9B9';
                    } else {
                        e.target.parentElement.parentElement.style.backgroundColor = '#f8f9fa';
                    }
                });
                div.append(nameInput);

                td.append(div);
                tr.append(td);
            }
            table.append(tr);
        }
    }

    /**
     * ビンゴシートの大きさ分の乱数を生成し、Setで返す関数
     * @param {*} size ビンゴシートのサイズ 
     * @param {*} min 乱数の下限値
     * @param {*} max 乱数の上限値
     * @returns ビンゴシートに入れる値を格納したSet
     */
    function createRandomSet(size, min, max) {
        // ビンゴシートの値は重複を許さないので、Setを使う
        randomSet = new Set();

        // Setの要素数がビンゴシートを埋め切れる数になるまで乱数生成
        while (randomSet.size < size * size) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            randomSet.add(num);
        }

        return randomSet;
    }
})

