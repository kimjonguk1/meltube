const $nav = document.getElementById('nav')
const $navItems = Array.from($nav.querySelectorAll(':scope > .menu > .item[rel]'));
const $main = document.getElementById('main')
const $mainContents = Array.from($main.querySelectorAll(':scope > .content[rel]'));


const navActionMap = {
    'mymusic.register': () => $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.register').querySelector(':scope > form').reset(),
    'mymusic.register_history': () => $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.register_history').querySelector(':scope > .button-container > [name = "refresh"]').click(),
    'admin.music': () => $mainContents.find((x) => x.getAttribute('rel') === 'admin.music').querySelector(':scope > .button-container > [name = "refresh"]').click(),
}

$navItems.forEach(($navItem) => {
    $navItem.onclick = () => {
        const rel = $navItem.getAttribute('rel')
        const action = navActionMap[rel];
        const $mailContent = $mainContents.find((x) => x.getAttribute('rel') === rel);
        if (typeof action === 'function') {
            action();
        }
        $navItems.forEach((x) => x.classList.remove('-selected'));
        $navItem.classList.add('-selected')
        $mainContents.forEach((x) => x.hide());
        $mailContent.show();
    }
});


//region 헤더 검색
{
    const $header = $main.querySelector(':scope > .header')
    const $searchForm = $header.querySelector(':scope > .search-form')
    $searchForm.onsubmit = (e) => {
        e.preventDefault();
        if($searchForm['keyword'].value === '' ) {
            return
        }

        const xhr = new XMLHttpRequest();
        const url = new URL(location.href)
        url.pathname = '/music/search'
        url.searchParams.set('keyword', $searchForm['keyword'].value);
        //URL 객체를 사용하는 이유는 주소에 들어가는 keyword의 인코딩 문제 때문
        //GET 방식 + 정해진 틀이 업슨 값이 입력될 수 있을 때에는 URL 객체를 활용
        xhr.onreadystatechange = () => {
            if(xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            Loading.hide();
            if(xhr.status < 200 || xhr.status >= 300) {
                Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요')
                return;
            }
            const response = JSON.parse(xhr.responseText);
            const $content = $mainContents.find((x)=> x.getAttribute('rel') === 'home.search')
            const $result = $content.querySelector(':scope > .result')
            const $tbody = $content.querySelector(':scope > tbody')
            const $init = $content.querySelector(':scope > .init')
            $tbody.querySelectorAll(':scope > tr').forEach(($tr) => {
                if(!$tr.classList.contains('empty')) {
                    $tr.remove();
                }
            })
            if(response.length === 0) {
                $tbody.querySelector(':scope > tr.empty').style.display = 'table-row';
            } else {
                $tbody.querySelector(':scope > tr.empty').style.display = 'none';
                for(const music of response) {

                }
            }
        };
        xhr.open('GET', url.toString());
        xhr.send();
        Loading.show(0)

    }
}
//endregion
//region 음원 등록 신청(mymusic.register)
{
    const $content = $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.register');
    const $form = $content.querySelector(':scope > form');

    const $melonResultInit = $form.querySelector(':scope > .melon > .row > .result > .init');
    const $melonResultLoading = $form.querySelector(':scope > .melon > .row > .result > .loading');
    const $melonResultEmpty = $form.querySelector(':scope > .melon > .row > .result > .empty');
    const $melonResultError = $form.querySelector(':scope > .melon > .row > .result > .error');
    let melonSearchTimeout;
    let melonSearchLastKeyword;
    // 키워드를 입력할 때 마다 xhr 요청 보내기 (1초 딜레이를 줘야 안터짐)
    $form['melonKeyword'].addEventListener('keyup', () => {
        $form.querySelectorAll(':scope > .melon > .row > .result > .item').forEach((x) => x.remove()) // 기존 검색 결과 삭제
        $melonResultEmpty.style.display = 'none';
        $melonResultError.style.display = 'none';
        if ($form['melonKeyword'].value === '') {
            $melonResultInit.style.display = 'flex'
            $melonResultLoading.style.display = 'none'
        } else {
            $melonResultInit.style.display = 'none'
            $melonResultLoading.style.display = 'flex'
            if (typeof melonSearchTimeout === 'number') {
                clearTimeout(melonSearchTimeout);
            }
            melonSearchLastKeyword = $form['melonKeyword'].value;
            melonSearchTimeout = setTimeout(() => {
                if (melonSearchLastKeyword !== $form['melonKeyword'].value) {
                    return;
                }
                const xhr = new XMLHttpRequest();
                const url = new URL(location.href);
                url.pathname = '/music/search-melon'
                url.searchParams.set('keyword', $form['melonKeyword'].value);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState !== XMLHttpRequest.DONE) {
                        return;
                    }
                    $melonResultLoading.style.display = 'none';
                    if (xhr.status < 200 || xhr.status >= 300 || xhr.responseText.length === 0) {
                        $melonResultError.style.display = 'flex'
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    if (response.length === 0) {
                        $melonResultEmpty.style.display = 'flex';
                    } else {
                        const $result = $form.querySelector(':scope > .melon > .row > .result');
                        for (const music of response) {
                            const $item = document.createElement('span');
                            $item.classList.add('item')
                            const $image = document.createElement('img');
                            $image.classList.add('image')
                            $image.src = music['coverFileName'];
                            const $column = document.createElement('span')
                            $column.classList.add('column')
                            const $name = document.createElement('span')
                            $name.classList.add('name')
                            $name.innerText = music['name'];
                            const $artist = document.createElement('span')
                            $artist.classList.add('artist');
                            $artist.innerText = music['artist'];
                            $column.append($name, $artist);
                            $item.append($image, $column);
                            $item.onmousedown = () => {
                                $form['melonId'].value = music['youtubeId'];
                                $form['melonCrawlButton'].click();
                            }
                            $result.append($item)
                        }
                    }
                };
                xhr.open('GET', url.toString());
                xhr.send();

            }, 1000)
        }
    });

    $form['melonCrawlButton'].onclick = () => {
        const $melonLabel = $form.findLabel('melon');
        $melonLabel.setValid($form['melonId'].value.length > 0);
        if (!$melonLabel.isValid()) {
            return;
        }
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            Loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                Dialog.show({
                    title: '오류',
                    content: '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요',
                    buttons: [{
                        text: '확인',
                        onclick: ($dialog) => Dialog.hide($dialog)
                    }]
                })
                return;
            }
            if (xhr.responseText.length === 0) {
                Dialog.show({
                    title: '멜론 음원 검색',
                    content: `입력하신 멜론 음원 식별자 <b>${$form['melonId'].value}</b> 를 통해 음원을 검색 할 수 없습니다. <br><br>멜론 음원 식별자를 다시 확인해 주세요`,
                    buttons: [{
                        text: '확인',
                        onclick: ($dialog) => Dialog.hide($dialog)
                    }]
                })
                return;
            }
            const response = JSON.parse(xhr.responseText);
            const $coverPreviewText = $form.querySelector(':scope > .cover > .row > .preview-wrapper > .text');
            const $coverPreviewImage = $form.querySelector(':scope > .cover > .row > .preview-wrapper > .image')
            $coverPreviewText.style.display = 'none';
            $coverPreviewImage.src = response['coverFileName'];
            $coverPreviewImage.style.display = 'block';
            if (response['youtubeId'] != null) {
                $form['youtubeId'].value = response['youtubeId'];
                $form['youtubeIdCheckButton'].click();
            } else {
                const $Text = $form.querySelector(':scope > .youtube > .row > .iframe-wrapper > .text')
                const $ifram = $form.querySelector(':scope > .youtube > .row > .iframe-wrapper > .iframe')
                $Text.style.display = 'flex';
                $ifram.style.display = 'none'
                $form['youtubeId'].value = '';
            }
            $form['artist'].value = response['artist'];
            $form['album'].value = response['album'];
            $form['releaseDate'].value = response['releaseDate'];
            $form['genre'].value = response['genre'];
            $form['name'].value = response['name'];
            $form['lyrics'].value = response['lyrics'];
        };
        xhr.open('GET', `/music/crawl-melon?id=${$form['melonId'].value}`);
        xhr.send();
        Loading.show(0)
    }

    $form['_cover'].onchange = () => {
        const $text = $form.querySelector(':scope > .cover > .row > .preview-wrapper > .text')
        const $image = $form.querySelector(':scope > .cover > .row > .preview-wrapper > .image')
        if (($form['_cover'].files?.length ?? 0) === 0) {
            $text.style.display = 'flex'
            $image.style.display = 'none'
            $image.src = '';
            return;
        }
        $text.style.display = 'none'
        $image.style.display = 'block'
        $image.src = URL.createObjectURL($form['_cover'].files[0]);
    }


    $form['youtubeIdCheckButton'].onclick = () => {
        const youtubeId = $form['youtubeId'].value;
        if (youtubeId.length !== 11) {
            Dialog.show({
                title: '유튜브 식별자 확인',
                content: '올바른 유튜브 식별자를 입력해 주세요',
                buttons: [{
                    text: '확인', onclick: ($dialog) => {
                        Dialog.hide($dialog);
                        $form['youtubeId'].focus();
                        $form['youtubeId'].select();
                    }
                }]
            })
            return
        }
        const $text = $form.querySelector(':scope > .youtube > .row > .iframe-wrapper > .text');
        const $iframe = $form.querySelector(':scope > .youtube > .row > .iframe-wrapper > .iframe');
        $iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            Loading.hide();
            if (xhr.status === 404) {
                Dialog.show({
                    title: '유튜브 식별자 확인',
                    content: `입력하신 식별자 <b>${youtubeId}</b>로 조회할 수 있는 영상이 확인되지 않습니다.<br><br>식별자를 다시 확인해 주세요`,
                    buttons: [{
                        text: '확인', onclick: ($dialog) => {
                            Dialog.hide($dialog);
                            $form['youtubeId'].focus();
                            $form['youtubeId'].select();
                        }
                    }]
                })
                return;
            }
            const response = JSON.parse(xhr.responseText);
            if (response['result'] === true) {
                $iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
                $iframe.style.display = 'block'
                $text.style.display = 'none'
            } else {
                Dialog.show({
                    title: '유튜브 식별자 확인',
                    content: `입력하신 식별자 <b>${youtubeId}</b>로 조회할 수 있는 영상이 확인되지 않습니다.<br><br>식별자를 다시 확인해 주세요`,
                    buttons: [{
                        text: '확인', onclick: ($dialog) => {
                            Dialog.hide($dialog);
                            $form['youtubeId'].focus();
                            $form['youtubeId'].select();
                        }
                    }]
                })
            }

        };
        xhr.open('GET', `/music/verify-youtube-id?id=${youtubeId}`);
        xhr.send();
        Loading.show(0);
        $iframe.style.display = 'none'
        $iframe.style.display = 'flex'
    }

    $form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        const $previewImage = $form.querySelector(':scope > .cover > .row > .preview-wrapper > .image');
        if ($previewImage.getAttribute('src').startsWith('http://') || $previewImage.getAttribute('src').startsWith('https://')) {
            formData.append('coverFileName', $previewImage.getAttribute('src'));
        } else if ($previewImage.getAttribute('src').startsWith('blob:')) {
            formData.append('_cover', $form['_cover'].files[0]);
        } else {
            Dialog.show({
                title: '음원 등록 신청',
                content: '커버 이미지를 선택해 주세요',
                buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
            })
            return;
        }
        const $youtubeIframe = $form.querySelector(':scope > .youtube > .row > .iframe-wrapper > .iframe');
        if ($form['youtubeId'].value.length !== 11 || $form['youtubeId'].value !== $youtubeIframe.getAttribute('src').split('/').at(-1)) {
            Dialog.show({
                title: '음원 등록 신청',
                content: '유튜브 식별자를 검증해 주세요',
                buttons: [{text: '확인', onclick: ($dialog) => Dialog.hide($dialog)}]
            })
            return;
        }
        formData.append('youtubeId', $form['youtubeId'].value);
        const $artistLabel = $form.findLabel('artist')
        const $albumLabel = $form.findLabel('album')
        const $releaseDateLabel = $form.findLabel('releaseDate')
        const $genreLabel = $form.findLabel('genre')
        const $nameLabel = $form.findLabel('name')
        $artistLabel.setValid($form['artist'].value.length >= 1 && $form['artist'].value.length <= 50);
        $albumLabel.setValid($form['album'].value.length >= 1 && $form['album'].value.length <= 50);
        $releaseDateLabel.setValid($form['releaseDate'].value !== '');
        $genreLabel.setValid($form['genre'].value.length >= 1 && $form['genre'].value.length <= 50);
        $nameLabel.setValid($form['name'].value.length >= 1 && $form['name'].value.length <= 50);
        if (!$artistLabel.isValid() || !$albumLabel.isValid() || !$releaseDateLabel.isValid() || !$genreLabel.isValid() || !$nameLabel.isValid()) {
            return;
        }
        formData.append('artist', $form['artist'].value);
        formData.append('album', $form['album'].value);
        formData.append('releaseDate', $form['releaseDate'].value);
        formData.append('genre', $form['genre'].value);
        formData.append('name', $form['name'].value);
        formData.append('lyrics', $form['lyrics'].value);

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            Loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                Dialog.show({
                    title: '오류',
                    content: '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요',
                    buttons: [{
                        text: '확인',
                        onclick: ($dialog) => Dialog.hide($dialog)
                    }]
                })
                return;
            }
            console.log(xhr.responseText);
            const response = JSON.parse(xhr.responseText);
            const [title, content, onclick] = {
                failure: ['음원 등록 신청', '알수 없는 이유로 음원 등록 신청에 실패하였습니다. 잠시 후 다시 시도해 주세요', ($dialog) => Dialog.hide($dialog)],
                failure_duplicate_youtube_id: ['음원 등록 신청', `입력하신 유튜브 식별자<b>${$form['youtubeId'].value}</b>는 이미 등록되어 있습니다. <br><br>다시 한번 확인해 주세요`, ($dialog) => Dialog.hide($dialog)],
                failure_unsigned: ['음원 등록 신청', `세션이 만료되었습니다. 로그인 후 다시 시도해 주세요. <br><br>확인 버튼을 클릭하면 로그인 페이지로 이동합니다`, ($dialog) => Dialog.hide($dialog)],
                success: ['음원 등록 신청', `음원 등록 신청이 완료되었습니다.<br><br>심사 완료 후 신청한 음원이 공개 상태로 전환됩니다.<br><br> 확인 버튼을 클릭하면 음원 등록 신청 내역 페이지로 이동합니다`, ($dialog) => {
                    Dialog.hide($dialog)
                    $navItems.find((x) => x.getAttribute('rel') === 'mymusic.register_history').click();
                }],
            }[response['result']] || ['오류', '서버가 알수없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요', ($dialog) => Dialog.hide($dialog)];
            Dialog.show({
                title: title,
                content: content,
                buttons: [{text: '확인', onclick: onclick}]
            })
        };
        xhr.open('POST', '/music/');
        xhr.send(formData);
        Loading.show(0);
    }
}
//endregion
//region 음원 등록 신청 내역(mymusic.register_history)
{
    /**
     *
     * @param {Array<number>} indexArray
     */
    const withdraw = (indexArray) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        for (const index of indexArray) {
            formData.append('indexes', index.toString());
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            Loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                Dialog.show({
                    title: '오류',
                    content: `요청을 전송하는 동안 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요`,
                    buttons: [{
                        text: '확인',
                        onclick: ($dialog) => Dialog.hide($dialog)
                    }]
                })
                return;
            }
            const response = JSON.parse(xhr.responseText);
            const [title, content, onclick] = {
                failure: ['음원 등록 신청 취소', '알수 없는 이유로 음원 등록 신청 취소에 실패하였습니다. 잠시 후 다시 시도해 주세요'],
                failure_unsigned: ['음원 등록 신청 취소', `세션이 만료되었습니다. 로그인 후 다시 시도해 주세요. <br><br>확인 버튼을 클릭하면 로그인 페이지로 이동합니다`, ($dialog) => {
                    Dialog.hide($dialog);
                    location.reload();
                }],
                success: ['음원 등록 신청 취소', '음원 등록 신청이 성공적으로 취소되었습니다', ($dialog) => {
                    Dialog.hide($dialog);
                    $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.register_history').querySelector(':scope > .button-container > [name="refresh"]').click();
                }],
            }[response['result']] || ['오류', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.', ($dialog) => Dialog.hide($dialog)];
            Dialog.show({
                title: title,
                content: content,
                buttons: [{
                    text: '확인',
                    onclick: onclick
                }]
            })
        };
        xhr.open('DELETE', '/music/');
        xhr.send(formData);
        Loading.show(0)
    }
    const $content = $mainContents.find((x) => x.getAttribute('rel') === 'mymusic.register_history');
    const $refreshButton = $content.querySelector(':scope > .button-container > [name="refresh"]')
    const $table = $content.querySelector(':scope > table')
    const $tbody = $table.querySelector(':scope > tbody')
    const $selectAllButton = $content.querySelector(':scope > .button-container > [name = "selectAll"]');
    const $unselectAllButton = $content.querySelector(':scope > .button-container > [name = "unselectAll"]');
    const $withdrawButton = $content.querySelector(':scope > .button-container > [name = "withdraw"]');

    $selectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > label > input[name="check"]').forEach((x) => x.checked = true);
    $unselectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > label > input[name="check"]').forEach((x) => x.checked = false);

    $withdrawButton.onclick = () => {
        const $trs = $tbody.querySelectorAll(':scope > tr');
        const indexArray = [];
        let invalidTrIncluded = false;
        for (const $tr of $trs) {
            if ($tr.querySelector(':scope > td > label > input[name="check"]').checked) {
                indexArray.push($tr.dataset['index']);
                if ($tr.dataset['status'] !== 'PENDING') {
                    invalidTrIncluded = true;
                    break;
                }
            }
        }
        if (invalidTrIncluded === true) {
            Dialog.show({
                title: '선택 신청 취소',
                content: `상태가 <i>승인 대기 중</i> 이 아닌 항목을 신청 취소 할 수 없습니다`,
                buttons: [{
                    text: '확인',
                    onclick: ($dialog) => Dialog.hide($dialog)
                }]
            })
            return;
        }

        if (indexArray.length === 0) {
            Dialog.show({
                title: '선택 신청 취소',
                content: '음원 등록 신청을 취소할 항목을 한 개 이상 체크해 주세요',
                buttons: [{
                    text: '확인',
                    onclick: ($dialog) => Dialog.hide($dialog)
                }]
            })
            return
        }
        Dialog.show({
            title: '선택 신청 취소',
            content: `정말로 선택한 <b>${indexArray.length.toLocaleString()}</b>개의 음원 등록 신청을 취소할까요? <br><br>취소한 내역은 복구할 수 없습니다`,
            buttons: [{
                text: '취소',
                onclick: ($dialog) => Dialog.hide($dialog)
            }, {
                text: '계속',
                onclick: ($dialog) => {
                    Dialog.hide($dialog);
                    withdraw(indexArray)
                }
            }]
        })
    }

    $refreshButton.onclick = () => {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            Loading.hide();
            if (xhr.status < 200 || xhr.status >= 300) {
                Dialog.show({
                    title: '오류',
                    content: '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요',
                    buttons: [{
                        text: '확인',
                        onclick: ($dialog) => Dialog.hide($dialog)
                    }]
                })
                return;
            }
            const response = JSON.parse(xhr.responseText);
            if (response['result'] === 'failure') {
                Dialog.show({
                    title: '음원 등록 신청 내역',
                    content: '알수 없는 이유로 음원 등록 신청 내역을 조회하지 못하였습니다. 잠시 후 다시 시도해 주세요',
                    buttons: [{
                        text: '확인',
                        onclick: ($dialog) => Dialog.hide($dialog)
                    }]
                })
            } else if (response['result'] === 'failure_unsigned') {
                Dialog.show({
                    title: '음원 등록 신청 내역',
                    content: `세션이 만료되었습니다. 로그인 후 다시 시도해 주세요. <br><br>확인 버튼을 클릭하면 로그인 페이지로 이동합니다`,
                    buttons: [{
                        text: '확인',
                        onclick: ($dialog) => {
                            Dialog.hide($dialog);
                            location.reload()
                        }
                    }]
                })
            } else if (response['result'] === 'success') {
                $tbody.innerHTML = '';
                console.log(response['result']);
                for (const music of response['musics']) {
                    const $tr = new DOMParser().parseFromString(`
                    <table>
                        <tbody>
                            <tr data-index="${music['index']}" data-status="${music['status']}">
                            <td>
                                <label class="--obj-check-label">
                                    <input type="checkbox" class="_input" name="check">
                                    <span class="_box"></span>
                                </label>
                            </td>
                            <td class="-text-align-center">${music['index']}</td>
                            <td class="-no-padding"><img src="music/cover?index=${music['index']}" alt="" class="cover"></td>
                            <td>${music['artist']}</td>
                            <td>${music['album']}</td>
                            <td class="-text-align-center">${music['releaseDate'].map((x, i) => i === 0 ? x : x.toString().padStart(2, '0')).join('-')}</td>
                            <td>${music['genre']}</td>
                            <td>${music['name']}</td>
                            <td>${music['youtubeId']}</td>
                            <td>${{ALLOWED: '승인', DENIED: '반려', PENDING: '승인 대기중'}[music['status']]}</td>
                            <td>
                                <button class="--obj-button -color-red -size-small" name="withdraw" type="button">신청 취소</button>
                            </td>
                            </tr>
                        </tbody>
                    </table>
                    `, 'text/html').querySelector('tr');
                    const $withdrawButton = $tr.querySelector(':scope > td > button[name="withdraw"]');
                    $withdrawButton.onclick = () => {
                        if (music['status'] !== 'PENDING') {
                            Dialog.show({
                                title: '선택 신청 취소',
                                content: `상태가 <i>승인 대기 중</i> 이 아닌 항목을 신청 취소 할 수 없습니다`,
                                buttons: [{
                                    text: '확인',
                                    onclick: ($dialog) => Dialog.hide($dialog)
                                }]
                            })
                            return
                        }
                        Dialog.show({
                            title: '선택 신청 취소',
                            content: `정말로 해당 음원 등록 신청을 취소할까요? <br><br>취소한 내역은 복구할 수 없습니다`,
                            buttons: [{
                                text: '취소',
                                onclick: ($dialog) => Dialog.hide($dialog)
                            }, {
                                text: '계속',
                                onclick: ($dialog) => {
                                    Dialog.hide($dialog);
                                    withdraw([music['index']]);
                                }
                            }]
                        })
                    }
                    $tbody.append($tr)
                }
            } else {
                Dialog.show({
                    title: '음원 등록 신청 내역',
                    content: `서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요`,
                    buttons: [{
                        text: '확인',
                        onclick: ($dialog) => {
                            Dialog.hide($dialog);
                        }
                    }]
                })
            }
        };
        xhr.open('GET', '/music/inquiries');
        xhr.send();
        Loading.show(0);
    }
}
//endregion
//region 관리자 음원 관리(admin.music)
{
    const $content = $mainContents.find((x) => x.getAttribute('rel') === 'admin.music')
    if ($content) { // $content != null // $content!== null && $content !== undefined
        const $selectAllButton = $content.querySelector(':scope > .button-container > [name="selectAll"]');
        const $unselectAllButton = $content.querySelector(':scope > .button-container > [name="unselectAll"]');
        const $allowButton = $content.querySelector(':scope > .button-container > [name="allow"]');
        const $denyButton = $content.querySelector(':scope > .button-container > [name="deny"]');
        const $deleteButton = $content.querySelector(':scope > .button-container > [name="delete"]');
        const $refreshButton = $content.querySelector(':scope > .button-container > [name="refresh"]');
        const $table = $content.querySelector(':scope > table')
        const $tbody = $table.querySelector(':scope > tbody')
        const $filterForm = $content.querySelector(':scope > .button-container > .filter-form')
        const getCheckedTrs = () => Array.from($tbody.querySelectorAll(':scope > tr')).filter(($tr) => $tr.querySelector(':scope > td > label > input[name="check"]').checked)
        /**
         *
         * @param {Array<number>} indexes
         * @Param {boolean} status
         */
        const sendPatchStatusRequest = (indexes, status) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('status', status.toString())
            indexes.forEach((index) => formData.append('indexes', index.toString()));
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                Loading.hide()
                if (xhr.status < 200 || xhr.status >= 300) {
                    Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요')
                    return;
                }
                const response = JSON.parse(xhr.responseText);
                const title = status === true ? '음원 선택 승인' : '음원 선택 거절';
                const [content, onclick] = {
                    failure: ['알 수 없는 이유로 음원 상태를 변경하지 못하였습니다. 잠시 후 다시 시도해 주세요'],
                    failure_unsigned: [`세션이 만료되었습니다. 로그인 후 다시 시도해 주세요.<br><br>확인 버튼을 클릭하면 로그인 페이지로 이동합니다`, () => location.reload()],
                    success: ['음원 상태를 성공적으로 변경하였습니다.', () => $content.querySelector(':scope > .button-container > [name="refresh"]').click()],
                }[response['result']] || ['서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요'];
                Dialog.defaultOk(title, content, onclick);
            };
            xhr.open('PATCH', '/admin/music/status'); // patchStatus
            xhr.send(formData);
            Loading.show(0)
        }

        /**
         *
         * @param {Array<number>} indexes
         */
        const sendDeleteRequest = (indexes) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            indexes.forEach((index) => formData.append('indexes', index.toString()));
            xhr.onreadystatechange = () => {
                if(xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                Loading.hide();
                if(xhr.status < 200 || xhr.status >= 300) {
                    Dialog.defaultOk('오류', '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요');
                    return;
                }
                const response = JSON.parse(xhr.responseText);
                const title = '음원 삭제'
                const [content, onclick] = {
                    failure: ['알수 없는 이유로 음원을 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요'],
                    success: [`음원을 성공적으로 삭제하였습니다.`, () => $content.querySelector(':scope > .button-container > button[name="refresh"]').click()]
                }[response['result']] || ['서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요']
                Dialog.defaultOk(title, content, onclick)
            };
            xhr.open('DELETE', '/admin/music/');
            xhr.send(formData);
            Loading.show(0)
        }

        $selectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > label > input[name="check"]').forEach((x) => x.checked = true);

        $unselectAllButton.onclick = () => $tbody.querySelectorAll(':scope > tr > td > label > input[name="check"]').forEach((x) => x.checked = false);

        $allowButton.onclick = () => {
            const $trs = getCheckedTrs();
            if ($trs.length === 0) {
                Dialog.defaultOk('선택 승인', '승인할 항목을 한 개 이상 선택해 주세요');
                return;
            }
            if ($trs.some(($tr) => $tr.dataset['deleted'] === 'true' || $tr.dataset['status'] !== 'PENDING')) {
                Dialog.defaultOk('선택 승인', `이미 삭제되었거나 승인 대기 중이 아닌 항목이 선택되어 있습니다. <br><br> 다시 한번 확인해 주세요`);
                return;
            }
            Dialog.defaultYesNo('선택 승인', `정말로 선택한 ${$trs.length.toLocaleString()}개의 음원을 승인할까요?`, () => {
                const indexes = $trs.map(($tr) => parseInt($tr.dataset['index']));
                sendPatchStatusRequest(indexes, true)
            })
        }

        $denyButton.onclick = () => {
            const $trs = getCheckedTrs();
            if ($trs.length === 0) {
                Dialog.defaultOk('선택 거절', '거절할 항목을 한 개 이상 선택해 주세요');
                return;
            }
            if ($trs.some(($tr) => $tr.dataset['deleted'] === 'true' || $tr.dataset['status'] !== 'PENDING')) {
                Dialog.defaultOk('선택 거절', `이미 삭제되었거나 승인 대기 중이 아닌 항목이 선택되어 있습니다. <br><br> 다시 한번 확인해 주세요`);
                return;
            }
            Dialog.defaultYesNo('선택 거절', `정말로 선택한 ${$trs.length.toLocaleString()}개의 음원을 거절할까요?`, () => {
                const indexes = $trs.map(($tr) => parseInt($tr.dataset['index']));
                sendPatchStatusRequest(indexes, false)
            })
        }

        $deleteButton.onclick = () => {
            const $trs = getCheckedTrs();
            if($trs.length === 0) {
                Dialog.defaultOk('선택 삭제', '삭제할 항목을 한 개 이상 선택해 주세요')
                return
            }
            if($trs.some(($tr) => $tr.dataset['deleted'] === 'true')) {
                Dialog.defaultOk('선택 삭제', `이미 삭제된 항목이 선택되어 있습니다. <br><br> 다시 한번 확인해 주세요`);
                return;
            }
            Dialog.defaultYesNo('선택 삭제', `정말로 선택한 ${$trs.length.toLocaleString()}개의 음원을 삭제할까요?`, () => {
                const indexes = $trs.map(($tr) => parseInt(($tr.dataset['index'])));
                sendDeleteRequest(indexes)
            })
        }

        $refreshButton.onclick = () => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                Loading.hide();
                if (xhr.status < 200 || xhr.status >= 300) {
                    Dialog.show({
                        title: '오류',
                        content: `요청을 전송하는 동안 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요`,
                        buttons: [{
                            text: '확인',
                            onclick: ($dialog) => Dialog.hide($dialog)
                        }]
                    })
                    return;
                }
                const response = JSON.parse(xhr.responseText);
                $filterForm['release'].click();
                $tbody.innerHTML = ''
                for (const music of response) {
                    const $tr = new DOMParser().parseFromString(`
                    <table>
                        <tbody>
                        <tr data-index = "${music['index']}" data-deleted="${music['deleted']}" data-status="${music['status']}">
                <td>
                    <label class="--obj-check-label">
                        <input type="checkbox" class="_input" name="check">
                        <span class="_box"></span>
                    </label>
                </td>
                <td class="-text-align-center">${music['index']}</td>
                <td>${music['userEmail']}</td>
                <td class="-no-padding"><img src="/music/cover?index=${music['index']}" alt="" class="cover"></td>
                <td>${music['artist']}</td>
                <td>${music['album']}</td>
                <td class="-text-align-center">${music['releaseDate']}</td>
                <td>${music['genre']}</td>
                <td>${music['name']}</td>
                <td>${music['youtubeId']}</td>
                <td>${music['deleted'] === true ? '삭제' : {
                        ALLOWED: '승인',
                        DENIED: '거절',
                        PENDING: '승인 대기중'
                    }[music['status']]}</td>
                <td>
                    <button class="--obj-button -color-light-gray -size-small" name="detail" type="button">자세히</button>
                    ${music['deleted'] === false && music['status'] === 'PENDING' ? `<button class="--obj-button -color-primary -size-small" name="allow" type="button">승인</button>
                    <button class="--obj-button -color-red -size-small" name="deny" type="button">거절</button>
                    ` : ''}
                    ${music['deleted'] === false ? `<button class="--obj-button -color-red -size-small" name="delete" type="button">삭제</button>
                    ` : ''}
                </td>
            </tr>
            </tbody>
                    </table>
                    
                    `, 'text/html').querySelector('tr');
                    $tr.querySelector(':scope > td > button[name="allow"]')?.addEventListener('click',  () => {
                        Dialog.defaultYesNo('선택 승인', `정말로 선택한 음원을 승인할까요?`, () => {
                            sendPatchStatusRequest([music['index']], true)
                        })
                    });
                    $tr.querySelector(':scope > td > button[name="deny"]')?.addEventListener('click', () => {
                        Dialog.defaultYesNo('선택 승인', `정말로 선택한 음원을 거절할까요?`, () => {
                            sendPatchStatusRequest([music['index']], false)
                        })
                    });
                    $tr.querySelector(':scope > td > button[name="delete"]')?.addEventListener('click', () => {
                        Dialog.defaultYesNo('선택 승인', `정말로 선택한 음원을 삭제할까요?`, () => {
                            sendDeleteRequest([music['index']])
                        })
                    });
                    $tbody.append($tr)
                }
            };
            xhr.open('GET', 'admin/music/');
            xhr.send();
            Loading.show(0)
        }

        $filterForm.onsubmit = (e) => {
            e.preventDefault();
            const $trs = Array.from($tbody.querySelectorAll(':scope > tr'))
            for(const $tr of $trs) {
                let visible = true;
                if($filterForm['status'].value === 'allowed') {
                    visible = $tr.dataset['status'] === 'ALLOWED' && $tr.dataset['deleted'] === 'false';
                }else if ($filterForm['status'].value === 'denied') {
                    visible = $tr.dataset['status'] === 'DENIED' && $tr.dataset['deleted'] === 'false';
                }else if ($filterForm['status'].value === 'pending') {
                    visible = $tr.dataset['status'] === 'PENDING' && $tr.dataset['deleted'] === 'false';
                }else if ($filterForm['status'].value === 'deleted') {
                    visible = $tr.dataset['deleted'] === 'true';
                }
                if(visible === true) {
                    const keyword = $filterForm['keyword'].value;
                    const $tds = Array.from($tr.querySelectorAll(':scope > td'));
                    visible = $tds[1].innerText.includes(keyword) ||
                        $tds[2].innerText.includes(keyword) ||
                        $tds[4].innerText.includes(keyword) ||
                        $tds[5].innerText.includes(keyword) ||
                        $tds[6].innerText.includes(keyword) ||
                        $tds[7].innerText.includes(keyword) ||
                        $tds[8].innerText.includes(keyword) ||
                        $tds[9].innerText.includes(keyword);
                }
                $tr.style.display = visible === true ? 'table-row' : 'none'

            }
        }

        $filterForm['release'].onclick = () => {
            $filterForm.reset();
            $tbody.querySelectorAll(':scope > tr').forEach(($tr) => $tr.style.display = 'table-row')
        }
    }
}
//endregion