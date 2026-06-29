/* ==========================================================================
   FRouT 論文レイアウト＆目次自動生成システム (超安全・データ保護版)
   ========================================================================== */

async function setupNavigation() {
    // 【対策】すでに組み立て済みなら多重実行しないようにガード
    if (document.querySelector('.index-chapter-section')) return;
    if (document.querySelector('.site-container')) return;

    // 1. bodyの直下に最初からある元の要素（header, section等）をすべて取得
    const originalNodes = Array.from(document.body.children).filter(node => node.tagName !== 'SCRIPT');

    // 2. 3カラムの大きな外枠（コンテナ）を作成
    const siteContainer = document.createElement('div');
    siteContainer.className = 'site-container';

    // 【左サイドバー枠】作成
    const sidebarLeft = document.createElement('aside');
    sidebarLeft.className = 'sidebar-left';
    sidebarLeft.id = 'shared-sidebar-left';

    // 【中央メインコンテンツ枠】作成
    const mainContent = document.createElement('main');
    mainContent.className = 'main-content';

    // 元の本文ノード群を、中身を破壊（クリア）せずにそのまま中央枠に「引っ越し」させる
    mainContent.append(...originalNodes);

    // 【右サイドバー枠】作成
    const sidebarRight = document.createElement('aside');
    sidebarRight.className = 'sidebar-right';
    sidebarRight.innerHTML = `
        <div class="sidebar-title">本文目次</div>
        <div class="sidebar-subtitle">Section Index</div>
        <nav><ul class="nav-list" id="detail-toc"></ul></nav>
    `;

    // 3. 左メニュー（共通ファイル）を非同期で読み込む
    try {
        const response = await fetch('./sidebar-left.html');
        if (response.ok) {
            const sidebarHTML = await response.text();
            sidebarLeft.innerHTML = sidebarHTML;
        } else {
            sidebarLeft.innerHTML = '<p style="padding:1rem; color:red;">Menu Load Error</p>';
        }
    } catch (error) {
        console.error('左サイドバーの読み込みに失敗しました:', error);
        sidebarLeft.innerHTML = '<p style="padding:1rem; color:red;">Network Error</p>';
    }

    // 4. 三つのパーツをコンテナに合体
    siteContainer.appendChild(sidebarLeft);
    siteContainer.appendChild(mainContent);
    siteContainer.appendChild(sidebarRight);

    // 5. 元のbodyの中身を綺麗にして、完成したコンテナをドンと配置する
    document.body.insertBefore(siteContainer, document.body.firstChild);

    // 6. 💡【機能強化】右サイドバーの詳細目次（h2, h3の自動抽出）を生成
    const tocContainer = document.getElementById('detail-toc');
    const headings = mainContent.querySelectorAll('h2, h3'); // h2とh3を両方取得

    headings.forEach(heading => {
        // IDがない場合はランダム生成して付与
        if (!heading.id) {
            heading.id = 'sec-' + Math.random().toString(36).slice(2, 9);
        }
        
        const li = document.createElement('li');
        
        // H2かH3かに応じて、CSSで区別できるようにクラスを出し分ける
        if (heading.tagName.toLowerCase() === 'h2') {
            li.className = 'nav-item nav-item-h2';
        } else {
            li.className = 'nav-item nav-item-h3';
        }
        
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.className = 'nav-link';
        
        // 見出しのレベルに合わせて先頭の記号を切り替える
        if (heading.tagName.toLowerCase() === 'h2') {
            a.textContent = `・ ${heading.textContent}`;
        } else {
            a.textContent = ` ${heading.textContent}`;
        }
        
        li.appendChild(a);
        tocContainer.appendChild(li);
    });

    // 7. スクロール連動（ハイライト）を起動
    initScrollObserver(mainContent);
}

function initScrollObserver(mainContent) {
    // 1. rootMarginの最適化だけで上下のスクロールに対応
    const observerOptions = { 
        root: null, 
        rootMargin: '-5% 0px -50% 0px', 
        threshold: 0
    };
    
    const rightLinks = document.querySelectorAll('#detail-toc .nav-link');
    if (rightLinks.length === 0) return;
    
    let lastIntersectingId = null;

    const observer = new IntersectionObserver((entries) => {
        // 余計なフラグチェック（If文）をすべて削除して軽量化
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // エリアに入った最新の見出しIDを記録
                lastIntersectingId = entry.target.getAttribute('id');
            }
        });

        // 目次のアクティブ状態を一括更新
        if (lastIntersectingId) {
            rightLinks.forEach(link => {
                if (link.getAttribute('href') === `#${lastIntersectingId}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }, observerOptions);
    
    // 2. 監視の開始
    mainContent.querySelectorAll('h2, h3').forEach(heading => {
        observer.observe(heading);
    });
    // 【改善点】トップ付近にいるときは、自動的に最初の見出しをアクティブにする
    window.addEventListener('scroll', () => {
        if (window.scrollY < 100 && rightLinks.length > 0) {
            const firstId = rightLinks[0].getAttribute('href').replace('#', '');
            lastIntersectingId = firstId;
            updateTocHighlight(firstId);
        }
    }, { passive: true }); // passive要素をつけてスクロール負荷を軽減
}

// ブラウザがHTMLを完全に読み込み終わってから安全に着火（ガードコード付き）
document.addEventListener('DOMContentLoaded', () => {
    if (typeof setupNavigation === 'function') {
        setupNavigation();
    }
});