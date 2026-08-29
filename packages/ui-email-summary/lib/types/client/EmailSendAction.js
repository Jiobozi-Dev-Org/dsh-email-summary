import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * One assistant-message "send email" action in the message IconActions row.
 * Rendered as a pill button with an icon + label, using the shared theme
 * tokens so it sits consistently beside the copy / like / dislike icons.
 * @module @jiobozi-dev-org/dsh-client-ui-email-summary/client/EmailSendAction
 */
import { useCallback, useState } from 'react';
import { IconSendOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './EmailSendAction.module.css';
/**
 * A pill button that summarizes the current conversation and emails it.
 * @param props - the injected `send` verb and the bound translator.
 */
export function EmailSendAction({ send, t }) {
    const [pending, setPending] = useState(false);
    const [failure, setFailure] = useState(null);
    const onClick = useCallback(() => {
        if (pending)
            return;
        setPending(true);
        setFailure(null);
        void send().then((result) => {
            setPending(false);
            if (!result.ok)
                setFailure(result.error ?? t('send.failed'));
        });
    }, [pending, send, t]);
    return (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", className: css.actionPill, disabled: pending, title: t('send.title'), onClick: onClick, children: [_jsx(IconSendOutline16, { size: 14 }), _jsx("span", { children: pending ? t('send.pending') : t('send.label') })] }), failure !== null && _jsx("span", { className: css.failure, role: "status", children: failure })] }));
}
//# sourceMappingURL=EmailSendAction.js.map