import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * One assistant-message "send email" action in the message IconActions row.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSendAction
 */
import { useCallback, useState } from 'react';
/**
 * A single button that summarizes the current conversation and emails it.
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
    return (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: onClick, disabled: pending, title: t('send.title'), style: { cursor: pending ? 'wait' : 'pointer' }, children: pending ? t('send.pending') : t('send.label') }), failure !== null && (_jsx("span", { role: "status", style: { color: 'var(--dsh-color-danger, #c0392b)', fontSize: 12 }, children: failure }))] }));
}
//# sourceMappingURL=EmailSendAction.js.map