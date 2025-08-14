const firebaseConfig = {
  apiKey: "AIzaSyCO-NVdFayE4fPZCuF976f_rHIPbhemoJY",
  authDomain: "eigo-app-project.firebaseapp.com",
  projectId: "eigo-app-project",
  storageBucket: "eigo-app-project.firebasestorage.app",
  messagingSenderId: "583012775031",
  appId: "1:583012775031:web:4784c66e728d6c3126c272",
  measurementId: "G-G44JG2K16Z"
};

// Firebaseを初期化する
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); // Firebase Authenticationの機能を使う準備
const db = firebase.firestore(); // ★ Firestoreの機能を使う準備


document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    
    // --- データ管理 ---
    let words = [];
    let sentences = [];
    let currentIndex = 0;

    // ★ 復習対象の単語・例文を一時的に保存する配列
    let wordsForReview = [];
    let sentencesForReview = [];

    // --- ログイン状態の監視 ---
     // ★ asyncを追加して、非同期処理に対応
    auth.onAuthStateChanged(async user => {
        if (user) {
            // ★ ログインしている場合
            console.log(user.email + "でログインしています。");
            // ★ Firestoreからデータを読み込むように変更
            await loadDataFromFirestore(user.uid); 
            showModeSelectionScreen(); // 学習モード選択画面を表示
        } else {
            words = []; // ログアウト時にローカルデータをクリア
            sentences = []; // ログアウト時にローカルデータをクリア
            showAuthScreen();
        }
    });


    // --- 認証関連の画面 ---

    function showAuthScreen() {
        appContainer.innerHTML = '';
        const signUpButton = document.createElement('button');
        signUpButton.textContent = '新規登録';
        signUpButton.className = 'btn';
        signUpButton.addEventListener('click', showSignUpScreen);

        const loginButton = document.createElement('button');
        loginButton.textContent = 'ログイン';
        loginButton.className = 'btn back-btn'; // グレーのスタイル
        loginButton.style.marginTop = '15px';
        loginButton.addEventListener('click', showLoginScreen); 

        appContainer.appendChild(signUpButton);
        appContainer.appendChild(loginButton);
    }

    // ★★★ 新規登録画面 ★★★
    function showSignUpScreen() {
        appContainer.innerHTML = '';
        const form = document.createElement('form');
        form.className = 'registration-form';

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'メールアドレス';
        emailInput.className = 'input-field';
        emailInput.required = true;

        // ★ パスワード入力欄とアイコンをまとめるdivを作成
        const passwordWrapper = document.createElement('div');
        passwordWrapper.className = 'password-wrapper';

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'パスワード（6文字以上）';
        passwordInput.className = 'input-field';
        passwordInput.required = true;

        // ★ パスワード表示/非表示ボタンを追加
        const togglePasswordButton = document.createElement('span');
        togglePasswordButton.className = 'toggle-password';
        togglePasswordButton.innerHTML = '<i class="fa-solid fa-eye"></i>'; // Font Awesomeの目のアイコン
        togglePasswordButton.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordButton.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
        });

        passwordWrapper.appendChild(passwordInput);
        passwordWrapper.appendChild(togglePasswordButton);

        const signUpButton = document.createElement('button');
        signUpButton.type = 'submit';
        signUpButton.textContent = '登録する';
        signUpButton.className = 'btn';

        form.appendChild(emailInput);
        form.appendChild(passwordWrapper);
        form.appendChild(signUpButton);
        appContainer.appendChild(form);

        // フォーム送信時の処理
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;

            // Firebaseの機能でユーザーを作成
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // 登録成功
                    alert('登録が完了しました！');
                    // onAuthStateChangedが自動で検知して画面を切り替える
                })
                .catch((error) => {
                    // 登録失敗
                    alert('登録に失敗しました。\n' + error.message);
                });
        });
    }

    // ★★★ ログイン画面 ★★★
    function showLoginScreen() {
        appContainer.innerHTML = '';
        const form = document.createElement('form');
        form.className = 'registration-form';

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'メールアドレス';
        emailInput.className = 'input-field';
        emailInput.required = true;

        const passwordWrapper = document.createElement('div');
        passwordWrapper.className = 'password-wrapper';

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'パスワード';
        passwordInput.className = 'input-field';
        passwordInput.required = true;

        // ★ パスワード表示/非表示ボタンを追加
        const togglePasswordButton = document.createElement('span');
        togglePasswordButton.className = 'toggle-password';
        togglePasswordButton.innerHTML = '<i class="fa-solid fa-eye"></i>'; // Font Awesomeの目のアイコン
        togglePasswordButton.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordButton.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
        });

        passwordWrapper.appendChild(passwordInput);
        passwordWrapper.appendChild(togglePasswordButton);


        const loginButton = document.createElement('button');
        loginButton.type = 'submit';
        loginButton.textContent = 'ログインする';
        loginButton.className = 'btn';

        form.appendChild(emailInput);
        form.appendChild(passwordWrapper);
        form.appendChild(loginButton);
        appContainer.appendChild(form);

        // フォーム送信時の処理
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;

            // Firebaseの機能でログイン
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // ログイン成功
                    // onAuthStateChangedが自動で検知して画面を切り替える
                })
                .catch((error) => {
                    // ログイン失敗
                    alert('メールアドレスまたはパスワードが間違っています。\n' + error.message);
                });
        });
    }


    // --- データ読み込み/保存 ---
    // --- データ操作 (Firestore) ---

    async function loadDataFromFirestore(userId) {
        try {
            const wordsSnapshot = await db.collection('users').doc(userId).collection('words').get();
            words = wordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const sentencesSnapshot = await db.collection('users').doc(userId).collection('sentences').get();
            sentences = sentencesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            console.log('Firestoreからデータを読み込みました。');
        } catch (error) {
            console.error("データの読み込みに失敗しました:", error);
            alert("データの読み込みに失敗しました。");
        }
    }

    function saveWords() { localStorage.setItem('words', JSON.stringify(words)); }
    function saveSentences() { localStorage.setItem('sentences', JSON.stringify(sentences)); }

    // --- 画面表示 ---

    function showHomeScreen() {
        appContainer.innerHTML = '';
        const startButton = document.createElement('button');
        startButton.textContent = '学習を開始';
        startButton.className = 'btn';
        startButton.addEventListener('click', showModeSelectionScreen);
        appContainer.appendChild(startButton);
    }

    function showModeSelectionScreen() {
        appContainer.innerHTML = '';

        const logoutButton = document.createElement('button');
        logoutButton.textContent = 'ログアウト';
        logoutButton.className = 'btn delete-btn'; // 赤いスタイル
        logoutButton.style.position = 'absolute';
        logoutButton.style.top = '10px';
        logoutButton.style.right = '10px';
        logoutButton.style.padding = '5px 10px';
        logoutButton.style.fontSize = '0.9rem';
        logoutButton.addEventListener('click', () => auth.signOut());
        appContainer.appendChild(logoutButton);
        
        // 単語セクション
        const wordTitle = document.createElement('h2');
        wordTitle.textContent = '単語学習';
        wordTitle.className = 'section-title';
        
        const memorizeButton = document.createElement('button');
        memorizeButton.textContent = '単語を暗記する';
        memorizeButton.className = 'btn';
        memorizeButton.addEventListener('click', () => {
            // ★★★ ここで上限チェックを行う ★★★
            const FREE_PLAN_LIMIT = 100;
            if (words.length >= FREE_PLAN_LIMIT) {
                alert(`無料プランでは、登録できる単語は${FREE_PLAN_LIMIT}個までです。`);
            } else {
                showRegistrationScreen();
            }
        });

        const reviewButton = document.createElement('button');
        reviewButton.textContent = '単語を復習する';
        reviewButton.className = 'btn';
        reviewButton.style.marginTop = '10px';
        // ★★★ 復習オプション画面を呼び出すように変更 ★★★
        reviewButton.addEventListener('click', () => {
            if (words.length === 0) { alert('まだ単語が登録されていません。'); return; }
            showWordReviewOptionsScreen();
        });

        const listButton = document.createElement('button');
        listButton.textContent = '単語リストを見る';
        listButton.className = 'btn list-btn';
        listButton.style.marginTop = '10px';
        listButton.addEventListener('click', showListPage);
        
        // --- 例文セクション ---
        const sentenceTitle = document.createElement('h2');
        sentenceTitle.textContent = '例文学習';
        sentenceTitle.className = 'section-title';
        
        const memorizeSentenceButton = document.createElement('button');
        memorizeSentenceButton.textContent = '例文を暗記する';
        memorizeSentenceButton.className = 'btn sentence-btn';
        memorizeSentenceButton.addEventListener('click', () => {
            // ★★★ ここで上限チェックを行う ★★★
            const FREE_PLAN_LIMIT = 50; // 例文の上限数を設定
            if (sentences.length >= FREE_PLAN_LIMIT) {
                alert(`無料プランでは、登録できる例文は${FREE_PLAN_LIMIT}個までです。`);
            } else {
                showSentenceRegistrationScreen();
            }
        });
        
        const reviewSentenceButton = document.createElement('button');
        reviewSentenceButton.textContent = '例文を復習する';
        reviewSentenceButton.className = 'btn sentence-btn';
        reviewSentenceButton.style.marginTop = '10px';
        // ★★★ 例文の復習オプション画面を呼び出すように変更 ★★★
        reviewSentenceButton.addEventListener('click', () => {
            if (sentences.length === 0) { alert('まだ例文が登録されていません。'); return; }
            showSentenceReviewOptionsScreen();
        });

        const sentenceListButton = document.createElement('button');
        sentenceListButton.textContent = '例文リストを見る';
        sentenceListButton.className = 'btn list-btn';
        sentenceListButton.style.marginTop = '10px';
        sentenceListButton.addEventListener('click', showSentenceListPage);

        appContainer.appendChild(wordTitle);
        appContainer.appendChild(memorizeButton);
        appContainer.appendChild(reviewButton);
        appContainer.appendChild(listButton);
        
        appContainer.appendChild(sentenceTitle);
        appContainer.appendChild(memorizeSentenceButton);
        appContainer.appendChild(reviewSentenceButton);
        appContainer.appendChild(sentenceListButton);
    }

    // ★★★ 単語の登録・編集画面 (Firestore対応) ★★★
    function showRegistrationScreen(editIndex = null) {
        const isEditMode = editIndex !== null;
        const existingWord = isEditMode ? words[editIndex] : null;
        let currentTags = isEditMode && existingWord.tags ? [...existingWord.tags] : [];

        appContainer.innerHTML = '';
        const form = document.createElement('form');
        form.className = 'registration-form';
        
        const englishInput = document.createElement('input');
        englishInput.type = 'text';
        englishInput.placeholder = '英単語';
        englishInput.className = 'input-field';
        englishInput.required = true;
        englishInput.value = isEditMode ? existingWord.english : '';

        const japaneseInput = document.createElement('input');
        japaneseInput.type = 'text';
        japaneseInput.placeholder = '日本語訳';
        japaneseInput.className = 'input-field';
        japaneseInput.required = true;
        japaneseInput.value = isEditMode ? existingWord.japanese : '';

        const memoInput = document.createElement('textarea');
        memoInput.placeholder = 'メモ（覚え方、例文など）';
        memoInput.className = 'input-field memo-field';
        memoInput.value = isEditMode ? existingWord.memo : '';

        // ★★★ タグ入力エリア  ★★★
        // --- 選択済みタグの表示エリア ---
        const tagContainer = document.createElement('div');
        tagContainer.className = 'tag-container';

        // ★★★ 既存タグ選択ボタン (UIの変更) ★★★
        const selectTagsButton = document.createElement('button');
        selectTagsButton.type = 'button'; // フォーム送信を防ぐ
        selectTagsButton.textContent = '既存のタグから選択';
        selectTagsButton.className = 'btn back-btn'; // グレーのボタン
        selectTagsButton.style.marginBottom = '15px';

        // --- 新規タグの入力エリア ---
        const tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.placeholder = 'または新しいタグを入力してEnter';
        tagInput.className = 'input-field';

        // 選択済みタグを描画する関数
        function renderTags() {
            tagContainer.innerHTML = '';
            currentTags.forEach((tag, index) => {
                const tagItem = document.createElement('span');
                tagItem.className = 'tag-item';
                tagItem.textContent = tag;
                const removeButton = document.createElement('span');
                removeButton.className = 'remove-tag';
                removeButton.textContent = '×';
                removeButton.onclick = () => {
                    currentTags.splice(index, 1);
                    renderTags(); // 再描画
                };
                tagItem.appendChild(removeButton);
                tagContainer.appendChild(tagItem);
            });
        }

        // ★ 既存タグ選択ボタンのクリックイベント
        selectTagsButton.addEventListener('click', () => {
            showTagSelectionModal(words, currentTags, (updatedTags) => {
                currentTags = updatedTags; // 選択結果を反映
                renderTags(); // 表示を更新
            });
        });

        // ★ Enterキーでタグを追加するイベント
        tagInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && tagInput.value.trim() !== '') {
                event.preventDefault();
                const newTag = tagInput.value.trim();
                if (!currentTags.includes(newTag)) {
                    currentTags.push(newTag);
                    renderTags(); // 選択済みタグを再描画
                    renderExistingTags(); // 新しいタグができたので既存タグリストも更新
                }
                tagInput.value = '';
            }
        });

        const registerButton = document.createElement('button');
        registerButton.type = 'submit';
        registerButton.textContent = isEditMode ? 'この内容で更新する' : 'この単語を登録する';
        registerButton.className = 'btn';

        // ★★★ 「×」ボタンを新規作成 ★★★
        const closeButton = document.createElement('i');
        closeButton.className = 'fa-solid fa-xmark close-button'; // Font Awesomeのバツ印アイコン
        closeButton.title = '閉じる';
        closeButton.addEventListener('click', () => {
            // 編集モードか新規登録かで戻る場所を変える
            if (isEditMode) {
                showListPage();
            } else {
                showModeSelectionScreen();
            }
        });

        form.appendChild(closeButton);
        form.appendChild(englishInput);
        form.appendChild(japaneseInput);
        form.appendChild(memoInput);
        form.appendChild(tagContainer); 
        form.appendChild(selectTagsButton); 
        form.appendChild(tagInput);
        form.appendChild(registerButton);

        appContainer.appendChild(form);

        // --- 初期描画 ---
        renderTags();

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const userId = auth.currentUser.uid;
            if (!userId) return;

            const wordData = {
                english: englishInput.value,
                japanese: japaneseInput.value,
                memo: memoInput.value,
                tags: currentTags
            };

            try {
                if (isEditMode) {
                    // 更新処理
                    const wordId = existingWord.id;
                    await db.collection('users').doc(userId).collection('words').doc(wordId).update(wordData);
                    alert('単語を更新しました！');
                    await loadDataFromFirestore(userId);
                    showListPage();
                } else {
                    // 新規追加処理
                    await db.collection('users').doc(userId).collection('words').add(wordData);
                    alert('単語を登録しました！');
                    await loadDataFromFirestore(userId);
                    showModeSelectionScreen();
                }
            } catch (error) {
                console.error("データベースエラー:", error);
                alert("処理に失敗しました。");
            }
        });
    }
    
    // ★★★ 例文の登録・編集画面 (Firestore対応) ★★★
    function showSentenceRegistrationScreen(editIndex = null) {
        const isEditMode = editIndex !== null;
        const existingSentence = isEditMode ? sentences[editIndex] : null;

        // ★ 現在のタグを管理する配列
        let currentTags = isEditMode && existingSentence.tags ? [...existingSentence.tags] : [];

        appContainer.innerHTML = '';
        const form = document.createElement('form');
        form.className = 'registration-form';
        
        const englishSentenceInput = document.createElement('textarea');
        englishSentenceInput.placeholder = '英語の例文';
        englishSentenceInput.className = 'input-field memo-field';
        englishSentenceInput.required = true;
        englishSentenceInput.value = isEditMode ? existingSentence.english : '';

        const japaneseTranslationInput = document.createElement('textarea');
        japaneseTranslationInput.placeholder = '日本語訳';
        japaneseTranslationInput.className = 'input-field memo-field';
        japaneseTranslationInput.required = true;
        japaneseTranslationInput.value = isEditMode ? existingSentence.japanese : '';

        const memoInput = document.createElement('textarea');
        memoInput.placeholder = 'メモ（文法、単語など）';
        memoInput.className = 'input-field memo-field';
        memoInput.value = isEditMode ? existingSentence.memo : '';

        // ★★★ タグ入力エリア (単語の時と同じものを追加) ★★★

        // --- 選択済みタグの表示エリア ---
        const tagContainer = document.createElement('div');
        tagContainer.className = 'tag-container';

        // ★★★ 既存タグ選択ボタン (UIの変更) ★★★
        const selectTagsButton = document.createElement('button');
        selectTagsButton.type = 'button'; // フォーム送信を防ぐ
        selectTagsButton.textContent = '既存のタグから選択';
        selectTagsButton.className = 'btn back-btn'; // グレーのボタン
        selectTagsButton.style.marginBottom = '15px';

        // --- 新規タグの入力エリア ---
        const tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.placeholder = 'または新しいタグを入力してEnter';
        tagInput.className = 'input-field';

        // ★ タグを画面に描画する関数
        function renderTags() {
            tagContainer.innerHTML = '';
            currentTags.forEach((tag, index) => {
                const tagItem = document.createElement('span');
                tagItem.className = 'tag-item';
                tagItem.textContent = tag;

                const removeButton = document.createElement('span');
                removeButton.className = 'remove-tag';
                removeButton.textContent = '×';
                removeButton.onclick = () => {
                    currentTags.splice(index, 1);
                    renderTags();
                };

                tagItem.appendChild(removeButton);
                tagContainer.appendChild(tagItem);
            });
        }

        // ★ 既存タグ選択ボタンのクリックイベント
        selectTagsButton.addEventListener('click', () => {
            showTagSelectionModal(sentences, currentTags, (updatedTags) => {
                currentTags = updatedTags; // 選択結果を反映
                renderTags(); // 表示を更新
            });
        });

        // Enterキーで新規タグを追加するイベント
        tagInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && tagInput.value.trim() !== '') {
                event.preventDefault();
                const newTag = tagInput.value.trim();
                if (!currentTags.includes(newTag)) {
                    currentTags.push(newTag);
                    renderTags(); // 選択済みタグを再描画
                }
                tagInput.value = '';
            }
        });


        const registerButton = document.createElement('button');
        registerButton.type = 'submit';
        registerButton.textContent = isEditMode ? 'この内容で更新する' : 'この例文を登録する';
        registerButton.className = 'btn sentence-btn';

        // ★★★ 「×」ボタンを新規作成 ★★★
        const closeButton = document.createElement('i');
        closeButton.className = 'fa-solid fa-xmark close-button'; // Font Awesomeのバツ印アイコン
        closeButton.title = '閉じる';
        closeButton.addEventListener('click', () => {
            // 編集モードか新規登録かで戻る場所を変える
            if (isEditMode) {
                showSentenceListPage();
            } else {
                showModeSelectionScreen();
            }
        });

        form.appendChild(closeButton);
        form.appendChild(englishSentenceInput);
        form.appendChild(japaneseTranslationInput);
        form.appendChild(memoInput);
        form.appendChild(tagContainer);
        form.appendChild(selectTagsButton);
        form.appendChild(tagInput);
        form.appendChild(registerButton);

        appContainer.appendChild(form);

        // --- 初期描画 ---
        renderTags();


        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const userId = auth.currentUser.uid;
            if (!userId) return;

            const sentenceData = {
                english: englishSentenceInput.value,
                japanese: japaneseTranslationInput.value,
                memo: memoInput.value,
                tags: currentTags // ★ 更新されたタグを保存
            };

            try {
                if (isEditMode) {
                    const sentenceId = existingSentence.id;
                    await db.collection('users').doc(userId).collection('sentences').doc(sentenceId).update(sentenceData);
                    alert('例文を更新しました！');
                    await loadDataFromFirestore(userId);
                    showSentenceListPage();
                } else {
                    await db.collection('users').doc(userId).collection('sentences').add(sentenceData);
                    alert('例文を登録しました！');
                    await loadDataFromFirestore(userId);
                    showModeSelectionScreen();
                }
            } catch (error) {
                console.error("データベースエラー:", error);
                alert("処理に失敗しました。");
            }
        });
    }

    // ★★★ 復習オプション画面 (新規追加) ★★★
    function showWordReviewOptionsScreen() {
        appContainer.innerHTML = '';

        const title = document.createElement('h2');
        title.textContent = '単語の復習方法を選択';
        title.className = 'section-title';

        // 「すべて復習」ボタン
        const reviewAllButton = document.createElement('button');
        reviewAllButton.textContent = 'すべての単語を復習';
        reviewAllButton.className = 'btn';
        reviewAllButton.addEventListener('click', () => {
            wordsForReview = [...words]; // すべての単語を復習対象にセット
            showWordReviewScreen();
        });

        // 「タグで絞り込む」ボタン
        const filterByTagButton = document.createElement('button');
        filterByTagButton.textContent = 'タグで絞り込んで復習';
        filterByTagButton.className = 'btn list-btn';
        filterByTagButton.style.marginTop = '15px';
        filterByTagButton.addEventListener('click', () => showTagSelectionScreen('words'));

        const backButton = document.createElement('button');
        backButton.textContent = '戻る';
        backButton.className = 'btn back-btn';
        backButton.style.marginTop = '30px';
        backButton.addEventListener('click', showModeSelectionScreen);

        appContainer.appendChild(title);
        appContainer.appendChild(reviewAllButton);
        appContainer.appendChild(filterByTagButton);
        appContainer.appendChild(backButton);
    }

    // ★★★ タグ選択画面 (新規追加) ★★★
    function showTagSelectionScreen(type) { // 'words' か 'sentences' を受け取る
        appContainer.innerHTML = '';
        
        const title = document.createElement('h2');
        title.textContent = '復習するタグを選択';
        title.className = 'section-title';

        const tagContainer = document.createElement('div');
        tagContainer.className = 'tag-selection-container';
        
        // 全データからユニークなタグリストを作成
        const allItems = (type === 'words') ? words : sentences;
        const uniqueTags = [...new Set(allItems.flatMap(item => item.tags || []))];

        if (uniqueTags.length === 0) {
            tagContainer.textContent = '利用可能なタグがありません。';
        } else {
            uniqueTags.forEach(tag => {
                const tagButton = document.createElement('button');
                tagButton.textContent = tag;
                tagButton.className = 'tag-button';
                tagButton.addEventListener('click', () => {
                    // 選択されたタグを持つ単語だけを絞り込む
                    wordsForReview = words.filter(word => word.tags && word.tags.includes(tag));
                    showWordReviewScreen();
                });
                tagContainer.appendChild(tagButton);
            });
        }
        
        const backButton = document.createElement('button');
        backButton.textContent = '戻る';
        backButton.className = 'btn back-btn';
        backButton.style.marginTop = '30px';
        backButton.addEventListener('click', showWordReviewOptionsScreen);
        
        appContainer.appendChild(title);
        appContainer.appendChild(tagContainer);
        appContainer.appendChild(backButton);
    }

    // ★★★ 単語復習画面のロジックを修正 ★★★
    function showWordReviewScreen() {
        currentIndex = 0;
        if (wordsForReview.length === 0) {
            alert('対象の単語が見つかりませんでした。');
            showWordReviewOptionsScreen();
            return;
        }
        renderCurrentCard();
    }
    
    function renderCurrentCard() {
        appContainer.innerHTML = '';
        const word = wordsForReview[currentIndex];

        const card = document.createElement('div');
        card.className = 'flashcard';
        card.innerHTML = `
            <div class="card-front">${word.english}</div>
            <div class="card-back">
                <div class="japanese-translation">${word.japanese}</div>
                <div class="memo">${word.memo || 'なし'}</div>
            </div>
        `;
        card.addEventListener('click', () => { card.classList.toggle('is-flipped'); });
        
        const navContainer = document.createElement('div');
        navContainer.className = 'card-nav';
        const prevButton = document.createElement('button');
        prevButton.textContent = '← 前へ';
        prevButton.className = 'btn nav-btn';
        prevButton.disabled = currentIndex === 0;
        prevButton.addEventListener('click', () => {
            currentIndex--;
            renderCurrentCard();
        });
        const nextButton = document.createElement('button');
        nextButton.textContent = '次へ →';
        nextButton.className = 'btn nav-btn';
        nextButton.disabled = currentIndex === wordsForReview.length - 1;
        nextButton.addEventListener('click', () => {
            currentIndex++;
            renderCurrentCard();
        });
        
        const backButton = document.createElement('button');
        backButton.textContent = 'モード選択に戻る';
        backButton.className = 'btn back-btn';
        backButton.addEventListener('click', showModeSelectionScreen);

        navContainer.appendChild(prevButton);
        navContainer.appendChild(nextButton);
        appContainer.appendChild(card);
        appContainer.appendChild(navContainer);
        appContainer.appendChild(backButton);
    }
    
    // ★★★ 単語リスト画面 (Firestore対応) ★★★
    function showListPage() {
        appContainer.innerHTML = '';
        const listContainer = document.createElement('div');
        listContainer.className = 'word-list-container';
        if (words.length === 0) {
            listContainer.textContent = '登録された単語はありません。';
        } else {
            words.forEach((word, index) => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-item';
                const wordText = document.createElement('span');
                wordText.className = 'word-text';
                wordText.textContent = `${word.english} : ${word.japanese}`;
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                const editButton = document.createElement('i');
                editButton.className = 'fa-solid fa-pencil edit-icon';
                editButton.title = 'Edit';
                editButton.addEventListener('click', () => { showRegistrationScreen(index); });

                const deleteButton = document.createElement('i');
                deleteButton.className = 'fa-solid fa-trash-can delete-icon';
                deleteButton.title = 'Delete';
                deleteButton.addEventListener('click', () => {
                    showConfirmationModal(`「${word.english}」を本当に削除しますか？`, async () => {
                        try {
                            const userId = auth.currentUser.uid;
                            await db.collection('users').doc(userId).collection('words').doc(word.id).delete();
                            await loadDataFromFirestore(userId); // データを再読み込み
                            showListPage(); // リストを再描画
                        } catch (error) {
                            console.error("削除エラー:", error);
                            alert("削除に失敗しました。");
                        }
                    });
                });

                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(deleteButton);
                wordItem.appendChild(wordText);
                wordItem.appendChild(buttonContainer);
                listContainer.appendChild(wordItem);
            });
        }
        
        const backButton = document.createElement('button');
        backButton.textContent = '戻る';
        backButton.className = 'btn back-btn';
        backButton.style.marginTop = '20px';
        backButton.addEventListener('click', showModeSelectionScreen);
        appContainer.appendChild(listContainer);
        appContainer.appendChild(backButton);
    }

    // ★★★ 例文の復習オプション画面 (新規追加) ★★★
    function showSentenceReviewOptionsScreen() {
        appContainer.innerHTML = '';

        const title = document.createElement('h2');
        title.textContent = '例文の復習方法を選択';
        title.className = 'section-title';

        const reviewAllButton = document.createElement('button');
        reviewAllButton.textContent = 'すべての例文を復習';
        reviewAllButton.className = 'btn sentence-btn';
        reviewAllButton.addEventListener('click', () => {
            sentencesForReview = [...sentences]; // すべての例文を復習対象に
            showSentenceReviewScreen();
        });

        const filterByTagButton = document.createElement('button');
        filterByTagButton.textContent = 'タグで絞り込んで復習';
        filterByTagButton.className = 'btn list-btn';
        filterByTagButton.style.marginTop = '15px';
        filterByTagButton.addEventListener('click', () => showTagSelectionScreen('sentences'));

        const backButton = document.createElement('button');
        backButton.textContent = '戻る';
        backButton.className = 'btn back-btn';
        backButton.style.marginTop = '30px';
        backButton.addEventListener('click', showModeSelectionScreen);

        appContainer.appendChild(title);
        appContainer.appendChild(reviewAllButton);
        appContainer.appendChild(filterByTagButton);
        appContainer.appendChild(backButton);
    }

    // ★★★ タグ選択画面のロジックを更新 ★★★
    function showTagSelectionScreen(type) {
        appContainer.innerHTML = '';
        
        const title = document.createElement('h2');
        title.textContent = '復習するタグを選択';
        title.className = 'section-title';

        const tagContainer = document.createElement('div');
        tagContainer.className = 'tag-selection-container';
        
        const allItems = (type === 'words') ? words : sentences;
        const uniqueTags = [...new Set(allItems.flatMap(item => item.tags || []))];

        if (uniqueTags.length === 0) {
            tagContainer.textContent = '利用可能なタグがありません。';
        } else {
            uniqueTags.forEach(tag => {
                const tagButton = document.createElement('button');
                tagButton.textContent = tag;
                tagButton.className = 'tag-button';
                tagButton.addEventListener('click', () => {
                    if (type === 'words') {
                        wordsForReview = words.filter(word => word.tags && word.tags.includes(tag));
                        showWordReviewScreen();
                    } else {
                        // ★ 例文用の絞り込みロジックを追加
                        sentencesForReview = sentences.filter(sentence => sentence.tags && sentence.tags.includes(tag));
                        showSentenceReviewScreen();
                    }
                });
                tagContainer.appendChild(tagButton);
            });
        }
        
        const backButton = document.createElement('button');
        backButton.textContent = '戻る';
        backButton.className = 'btn back-btn';
        backButton.style.marginTop = '30px';
        // ★ 戻るボタンの遷移先を修正
        backButton.addEventListener('click', (type === 'words') ? showWordReviewOptionsScreen : showSentenceReviewOptionsScreen);
        
        appContainer.appendChild(title);
        appContainer.appendChild(tagContainer);
        appContainer.appendChild(backButton);
    }

    // 例文の復習画面 (書き取り)
    function showSentenceReviewScreen() {
        currentIndex = 0;
        if (sentencesForReview.length === 0) {
            alert('対象の例文が見つかりませんでした。');
            showSentenceReviewOptionsScreen();
            return;
        }
        renderCurrentSentenceChallenge();
    }

    function renderCurrentSentenceChallenge() {
        appContainer.innerHTML = '';
        const sentence = sentencesForReview[currentIndex];
        const japaneseText = document.createElement('p');
        japaneseText.textContent = sentence.japanese;
        japaneseText.className = 'japanese-sentence';
        const userInput = document.createElement('textarea');
        userInput.placeholder = '英語の例文をここに入力...';
        userInput.className = 'input-field memo-field';
        const checkButton = document.createElement('button');
        checkButton.textContent = '答え合わせ';
        checkButton.className = 'btn';
        checkButton.style.marginTop = '15px';
        const answerContainer = document.createElement('div');
        answerContainer.className = 'answer-container';
        answerContainer.style.display = 'none';
        answerContainer.innerHTML = `
            <h4>正解:</h4>
            <p>${sentence.english}</p>
            <h4>メモ:</h4>
            <p>${sentence.memo || 'なし'}</p>
        `;
        checkButton.addEventListener('click', () => {
            answerContainer.style.display = 'block';
            checkButton.style.display = 'none';
        });

        const navContainer = document.createElement('div');
        navContainer.className = 'card-nav';
        const prevButton = document.createElement('button');
        prevButton.textContent = '← 前へ';
        prevButton.className = 'btn nav-btn';
        prevButton.disabled = currentIndex === 0;
        prevButton.addEventListener('click', () => {
            currentIndex--;
            renderCurrentSentenceChallenge();
        });
        const nextButton = document.createElement('button');
        nextButton.textContent = '次へ →';
        nextButton.className = 'btn nav-btn';
        nextButton.disabled = currentIndex === sentencesForReview.length - 1;
        nextButton.addEventListener('click', () => {
            currentIndex++;
            renderCurrentSentenceChallenge();
        });
        
        const backButton = document.createElement('button');
        backButton.textContent = 'モード選択に戻る';
        backButton.className = 'btn back-btn';
        backButton.addEventListener('click', showModeSelectionScreen);

        navContainer.appendChild(prevButton);
        navContainer.appendChild(nextButton);
        appContainer.appendChild(japaneseText);
        appContainer.appendChild(userInput);
        appContainer.appendChild(checkButton);
        appContainer.appendChild(answerContainer);
        appContainer.appendChild(navContainer);
        appContainer.appendChild(backButton);
    }
    
    // ★★★ 例文リスト画面 (Firestore対応) ★★★
    function showSentenceListPage() {
        appContainer.innerHTML = '';
        const listContainer = document.createElement('div');
        listContainer.className = 'word-list-container';

        if (sentences.length === 0) {
            listContainer.textContent = '登録された例文はありません。';
        } else {
            sentences.forEach((sentence, index) => {
                const sentenceItem = document.createElement('div');
                sentenceItem.className = 'word-item';
                const sentenceText = document.createElement('span');
                sentenceText.className = 'word-text';
                sentenceText.textContent = sentence.english;
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                const editButton = document.createElement('i');
                editButton.className = 'fa-solid fa-pencil edit-icon';
                editButton.title = 'Edit';
                editButton.addEventListener('click', () => {
                    showSentenceRegistrationScreen(index);
                });

                const deleteButton = document.createElement('i');
                deleteButton.className = 'fa-solid fa-trash-can delete-icon';
                deleteButton.title = 'Delete';
                deleteButton.addEventListener('click', () => {
                    showConfirmationModal(`この例文を本当に削除しますか？`, async () => {
                        try {
                            const userId = auth.currentUser.uid;
                            await db.collection('users').doc(userId).collection('sentences').doc(sentence.id).delete();
                            await loadDataFromFirestore(userId);
                            showSentenceListPage();
                        } catch (error) {
                            console.error("削除エラー:", error);
                            alert("削除に失敗しました。");
                        }
                    });
                });
                
                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(deleteButton);
                sentenceItem.appendChild(sentenceText);
                sentenceItem.appendChild(buttonContainer);
                listContainer.appendChild(sentenceItem);
            });
        }
        
        const backButton = document.createElement('button');
        backButton.textContent = '戻る';
        backButton.className = 'btn back-btn';
        backButton.style.marginTop = '20px';
        backButton.addEventListener('click', showModeSelectionScreen);
        appContainer.appendChild(listContainer);
        appContainer.appendChild(backButton);
    }

    // ★★★ 確認モーダルを表示する関数 (まるごと新規追加) ★★★
    function showConfirmationModal(message, onConfirm) {
        // モーダル要素の作成
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        modalOverlay.innerHTML = `
            <div class="modal-content">
                <p>${message}</p>
                <div class="modal-buttons">
                    <button class="btn back-btn" id="modal-cancel">いいえ</button>
                    <button class="btn delete-btn" id="modal-confirm">はい</button>
                </div>
            </div>
        `;

        // モーダルをbodyに追加
        document.body.appendChild(modalOverlay);

        // ボタンのイベントリスナー
        document.getElementById('modal-confirm').addEventListener('click', () => {
            onConfirm(); // 「はい」が押されたら渡された処理を実行
            document.body.removeChild(modalOverlay); // モーダルを削除
        });

        document.getElementById('modal-cancel').addEventListener('click', () => {
            document.body.removeChild(modalOverlay); // モーダルを削除
        });
    }

    // ★★★ タグ選択モーダルを表示する関数 (まるごと新規追加) ★★★
    function showTagSelectionModal(sourceArray, selectedTags, onComplete) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        let currentModalTags = [...selectedTags];

        const allUniqueTags = [...new Set(sourceArray.flatMap(item => item.tags || []))];

        let tagButtonsHTML = allUniqueTags.map(tag => {
            const isSelected = currentModalTags.includes(tag);
            return `<button class="tag-modal-item ${isSelected ? 'selected' : ''}" data-tag="${tag}" title="${tag}">${tag}</button>`;
        }).join('');

        modalOverlay.innerHTML = `
            <div class="tag-modal-content">
            <h3>既存のタグを選択</h3>
            <div class="tag-modal-list">${tagButtonsHTML}</div>
            <button class="btn" id="modal-done">完了</button>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        modalOverlay.querySelector('.tag-modal-list').addEventListener('click', (event) => {
            if (event.target.classList.contains('tag-modal-item')) {
                const tag = event.target.dataset.tag;
                if (currentModalTags.includes(tag)) {
                    currentModalTags = currentModalTags.filter(t => t !== tag);
                } else {
                    currentModalTags.push(tag);
                }
                event.target.classList.toggle('selected');
            }
        });

        modalOverlay.querySelector('#modal-done').addEventListener('click', () => {
            onComplete(currentModalTags);
            document.body.removeChild(modalOverlay);
        });
    }
});