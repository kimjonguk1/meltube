HTMLElement.prototype.hide = function () {
    this.classList.remove('-visible');
    return this;
}

HTMLElement.prototype.show = function () {
    this.classList.add('-visible');
    return this;
}
/**
 *
 * @param {string} dataId
 * @returns {HTMLLabelElement}
 */
HTMLFormElement.prototype.findLabel = function (dataId) {
    return this.querySelector(`label.--obj-label[data-id="${dataId}"]`)
}

/**
 *
 * @param {boolean} b
 * @param {string|undefined} warningText
 * @returns {HTMLLabelElement}
 */
HTMLLabelElement.prototype.setValid = function (b, warningText) {
    if(b === true) {
        this.classList.remove('-invalid');
    }else if(b===false) {
        this.classList.add('-invalid');
        if(typeof warningText === 'string') {
            this.querySelector(':scope > ._warning').innerText = warningText;
        }
    }
    return this;
}

HTMLLabelElement.prototype.isValid = function () {
    return !this.classList.contains('-invalid');
}

class Dialog {
    /** @type {HTMLElement} */
    static $cover;
    /** @type {Array<HTMLElement>} */
    static $dialogArray = [];

    /**
     *
     * @param {string} title
     * @param {string} content
     * @param {function(HTMLElement)|undefined} onclick
     */

    static defaultOk(title, content, onclick = undefined) {
        Dialog.show({
            title: title,
            content: content,
            buttons: [{
                text: '확인',
                onclick: ($dialog) => {
                    Dialog.hide($dialog);
                    if(typeof onclick === 'function') {
                        onclick($dialog);
                    }
                }
            }]
        })
    }

    /**
     *
     * @param {string} title
     * @param {string} content
     * @param {function(HTMLElement)|undefined} onYes
     * @param {function(HTMLElement)|undefined} onNo
     */

    static defaultYesNo(title, content, onYes = undefined, onNo = undefined) {
        Dialog.show({
            title:title,
            content:content,
            buttons: [
                {
                    text: '네', onclick: ($dialog) => {
                        Dialog.hide($dialog);
                        if(typeof onYes == 'function') {
                            onYes($dialog)
                        }
                    }
                },
                {
                    text: '아니요', onclick: ($dialog) => {
                        Dialog.hide($dialog);
                        if(typeof onYes == 'function') {
                            onNo($dialog)
                        }
                    }
                }

            ]
        })
    }

    /**
     *
     * @param {HTMLElement} $dialog
     */
    static hide($dialog) {
        Dialog.$dialogArray.splice(Dialog.$dialogArray.indexOf($dialog), 1);
        if(Dialog.$dialogArray.length === 0) {
            Dialog.$cover.hide();
        }
        $dialog.hide();
        setTimeout(()=> $dialog.remove(), 1000);
    }

    /**
     *
     * @param {Object} args
     * @param {string} args.title
     * @param {string} args.content
     * @param {Array<{text: string, onclick: function}>|undefined} args.buttons
     * @param {number} delay
     * @returns {HTMLElement}
     */
    static show(args, delay = 50) {
        const $dialog = document.createElement('div');
        $dialog.classList.add('---dialog')
        const $title = document.createElement('div');
        $title.classList.add('_title');
        $title.innerText = args.title;
        const $content = document.createElement('div');
        $content.classList.add('_content');
        $content.innerHTML = args.content;
        $dialog.append($title, $content)

        if(args.buttons != null && args.buttons.length > 0) {
            const $buttonContainer = document.createElement('div')
            $buttonContainer.classList.add('_button-container');
            $buttonContainer.style.gridTemplateColumns = `repeat(${args.buttons.length}, 1fr)`;
            for(const button of args.buttons) {
                const $button = document.createElement('button');
                $button.classList.add('_button');
                $button.setAttribute('type', 'button');
                $button.innerText = button.text;
                if(typeof button.onclick === 'function') {
                    $button.onclick = () => button.onclick($dialog); // 버튼 클릭 시, 현재 생성하고 있는 다이얼로그 요소를 인자로 전달해줌
                }
                $buttonContainer.append($button);
            }
            $dialog.append($buttonContainer);
        }
        document.body.prepend($dialog); // append는 제일 끝(마지막 자식)에 prepend는 제일 앞(첫번째 자식)에 추가
        Dialog.$dialogArray.push($dialog); // 다이얼로그 배열에 현재 생성한 다이얼로그 추가
        if(Dialog.$cover == null) {
            const $cover = document.createElement('div');
            $cover.classList.add('---dialog-cover');
            document.body.prepend($cover);
            Dialog.$cover = $cover;
        }
        setTimeout(() => {
            $dialog.show();
            Dialog.$cover.show()
        }, delay) // delay 밀리초 되에 show 해주는 이유는, 요소 생성 직후 -visible 붙이면 트랜지션이 안 먹기 때문
        return $dialog
    }
}

class Loading {
    /**
     * @type {HTMLElement}
     */
    static $element

    static hide() {
        Loading.$element?.hide();
    }

    /**
     *
     * @param {number} delay
     */
    static show(delay = 50) {
        if(Loading.$element == null) {
            const $element = document.createElement('div');
            $element.classList.add('---loading');
            const $icon = document.createElement('img');
            $icon.classList.add('_icon')
            $icon.setAttribute('alt', '');
            $icon.setAttribute('src', 'data:image/png;base64,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');
            const $text = document.createElement('span');
            $text.classList.add('_text')
            $text.innerText = '잠시만 기다려 주세요';
            $element.append($icon, $text);
            document.body.prepend($element);
            Loading.$element = $element;
        }
        setTimeout(() => Loading.$element.show(), delay)
    }
}