const $main = document.getElementById('main')
const $cover = document.getElementById('cover')
const $registerForm = document.getElementById('registerForm');

{
    const $content = $main.querySelector(':scope > .content')
    const $loginForm = $content.querySelector(':scope > .login-form')
    const $menu = $loginForm.querySelector(':scope > .menu')
    $menu.querySelector(':scope > .item > [rel="register"]').onclick = (e) => {
        e.preventDefault();
        $cover.onclick = () => {
            $cover.hide();
            $registerForm.hide();
        }
        $cover.show();
        $registerForm.reset();
        $registerForm.show();
    }
}

$registerForm.onsubmit = (e) => {
    e.preventDefault();
    const $emailLabel = $registerForm.findLabel('email');
    const $passwordLabel = $registerForm.findLabel('password');
    const $nicknameLabel = $registerForm.findLabel('nickname');
    const $contactLabel = $registerForm.findLabel('contact');
    $emailLabel.setValid($registerForm['email'].value.length >= 8 && $registerForm['email'].value.length <= 50);
    $passwordLabel.setValid($registerForm['password'].value.length >= 6 && $registerForm['password'].value.length <= 50, '올바른 비밀번호를 입력해 주세요');
    if($passwordLabel.isValid()) {
        $passwordLabel.setValid($registerForm['password'].value === $registerForm['passwordCheck'].value , '비밀번호가 일치하지 않습니다');
    }
    $nicknameLabel.setValid($registerForm['nickname'].value.length >= 2 && $registerForm['nickname'].value.length <= 10);
    $contactLabel.setValid($registerForm['contact'].value.length >= 10 && $registerForm['contact'].value.length <= 12);
    if(!$emailLabel.isValid() || !$passwordLabel.isValid() || !$nicknameLabel.isValid() || !$contactLabel.isValid()) {
        return;
    }
    if(!$registerForm['agree'].checked) {
        Dialog.show({
            title : '회원가입',
            content : '서비스 이용약관 및 개인정보 처리방침에 동의하지 않으면 회원가입을 하실 수 없습니다',
            buttons: [{
                text : '확인', onclick: ($dialog) => Dialog.hide($dialog)
            }]
        });
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', $registerForm['email'].value);
    formData.append('password', $registerForm['password'].value);
    formData.append('nickname', $registerForm['nickname'].value);
    formData.append('contact', $registerForm['contact'].value);
    xhr.onreadystatechange = () => {
        if(xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        Loading.hide();
        if(xhr.status < 200 || xhr.status >= 300) {
            Dialog.show({
                title : '오류',
                content: '요청을 전송하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요',
                buttons: [{
                    text : '확인',
                    onclick: ($dialog) => Dialog.hide($dialog)
                }]
            })
            return;
        }
        const response = JSON.parse(xhr.responseText);
        const [title, content, onclick] = {
            failure: ['회원가입', '알 수 없는 이유로 회원가입에 실패햐였습니다. 잠시 후 다시 시도해 주세요', ($dialog)=> Dialog.hide($dialog)],
            failure_duplicate_email: ['회원가입', `입력하신 이메일(${$registerForm['email'].value})은 이미 사용 중입니다. 다른 이메일을 사용해 주세요`, ($dialog) => Dialog.hide($dialog)],
            failure_duplicate_contact: ['회원가입', `입력하신 연락처(${$registerForm['contact'].value})은 이미 사용 중입니다. 다른 연락처를 사용해 주세요`, ($dialog) => Dialog.hide($dialog)],
            failure_duplicate_nickname: ['회원가입', `입력하신 닉네임(${$registerForm['nickname'].value})은 이미 사용 중입니다. 다른 닉네임 사용해 주세요`, ($dialog) => Dialog.hide($dialog)],
            success: ['회원가입', '회원가입해 주셔서 감사합니다. 입력하신 이메일로 계정을 인증할 수 있는 링크를 전송하였습니다. 계정 인증 후 로그인 할 수 있으며, 해당 링크는 24시간 동안만 유효하니 주의해 주세요', ($dialog) => {
                Dialog.hide($dialog);
                $registerForm.hide();
                $cover.hide();
            }],
        }[response['result']] || ['오류', '서버가 알수 없는 응답을 반환하였습니다 잠시 후 다시 시도해 주세요.', ($dialog) => Dialog.hide($dialog)];
        console.log(response['result']);
        Dialog.show({
            title : title,
            content : content,
            buttons: [{
                text : '확인', onclick: onclick
            }]
        });
    };
    xhr.open('POST', './user/');
    xhr.send(formData);
    Loading.show(0);
}

window.onload = () => {
    //모든요소가 준비되었을 때 실행되는 부분
    const $content = $main.querySelector(':scope > .content');
    const $logo = $content.querySelector(':scope > .logo');
    const $loginForm = $content.querySelector(':scope > .login-form');
    setTimeout(() => $logo.show(), 100);
    setTimeout(() => $loginForm.show(), 1000);
}