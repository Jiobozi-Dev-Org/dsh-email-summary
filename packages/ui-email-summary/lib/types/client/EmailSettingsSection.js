import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Email-summary plugin configuration card (shown in Settings → Plugins).
 * Collapsed by default, like the built-in plugin cards; expanding reveals the
 * SMTP + summary form, whose fields are persisted through the Host Remote.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
 */
import { useCallback, useEffect, useState } from 'react';
const card = { margin: 0, padding: 0, listStyle: 'none' };
const headerBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    width: '100%', padding: '14px 16px', border: 'none', background: 'transparent',
    cursor: 'pointer', textAlign: 'left', color: 'inherit',
};
const headerText = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 };
const title = { fontWeight: 600, fontSize: 15 };
const desc = { fontSize: 12, opacity: 0.65 };
const chevron = { fontSize: 12, opacity: 0.6, flexShrink: 0 };
const body = {
    padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560,
};
const groupLabel = { fontSize: 12, fontWeight: 600, color: '#2563eb', marginBottom: 2 };
const fieldRow = { display: 'flex', flexDirection: 'column', gap: 4 };
const fieldLabel = { fontSize: 13, fontWeight: 500 };
const fieldHint = { fontSize: 11, opacity: 0.55 };
const input = {
    padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.18)',
    fontSize: 14, background: '#fff', width: '100%',
};
const inlineRow = { display: 'flex', gap: 14 };
const inlineCol = { ...fieldRow, flex: 1 };
const footer = { display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 };
const saveBtn = {
    padding: '8px 18px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff',
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
};
const statusText = { fontSize: 13 };
/** A section header: the SMTP fields or the summary preference. */
function FieldGroup({ label, children }) {
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsx("div", { style: groupLabel, children: label }), children] }));
}
/**
 * The collapsible configuration card.
 * @param props - the injected Remote and bound translator.
 */
export function EmailSettingsSection({ api, t }) {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState(null);
    const [presets, setPresets] = useState([]);
    const [password, setPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    useEffect(() => {
        let alive = true;
        void api.getSettings().then((result) => {
            if (!alive)
                return;
            setSettings(result.settings);
            setPresets(result.presets);
        });
        return () => { alive = false; };
    }, [api]);
    const patch = useCallback((partial) => {
        setSettings(current => (current === null ? current : { ...current, ...partial }));
    }, []);
    const onProvider = useCallback((id) => {
        const preset = presets.find(item => item.id === id);
        if (preset !== undefined) {
            patch({ provider: id, smtpHost: preset.host, smtpPort: preset.port, secure: preset.secure });
        }
        else {
            patch({ provider: id });
        }
    }, [presets, patch]);
    const onSave = useCallback(() => {
        if (settings === null || saving)
            return;
        setSaving(true);
        setMessage(null);
        void (async () => {
            const saved = await api.saveSettings({ patch: settings });
            if (password !== '')
                await api.setPassword({ password });
            setSaving(false);
            setMessage(saved.ok ? t('settings.saved') : (saved.error ?? t('settings.error')));
        })();
    }, [settings, saving, password, api, t]);
    if (settings === null)
        return null;
    return (_jsxs("li", { style: card, children: [_jsxs("button", { type: "button", style: headerBtn, "aria-expanded": open, onClick: () => { setOpen(!open); }, children: [_jsxs("span", { style: headerText, children: [_jsx("span", { style: title, children: t('nav') }), _jsx("span", { style: desc, children: t('desc') })] }), _jsx("span", { style: chevron, children: open ? '▾' : '▸' })] }), open && (_jsxs("div", { style: body, children: [_jsx(FieldGroup, { label: t('settings.provider'), children: _jsx("select", { style: input, value: settings.provider, onChange: event => onProvider(event.target.value), children: presets.map(preset => _jsx("option", { value: preset.id, children: preset.label }, preset.id)) }) }), _jsxs(FieldGroup, { label: t('settings.host'), children: [_jsx("input", { style: input, value: settings.smtpHost, onChange: event => patch({ smtpHost: event.target.value }) }), _jsx("div", { style: fieldHint, children: t('settings.hostHint') })] }), _jsxs("div", { style: inlineRow, children: [_jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.port') }), _jsx("input", { style: input, type: "number", value: settings.smtpPort, onChange: event => patch({ smtpPort: Number(event.target.value) }) }), _jsx("span", { style: fieldHint, children: t('settings.portHint') })] }), _jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.secure') }), _jsxs("select", { style: input, value: settings.secure, onChange: event => patch({ secure: event.target.value }), children: [_jsx("option", { value: "starttls", children: "STARTTLS" }), _jsx("option", { value: "ssl", children: "SSL" }), _jsx("option", { value: "none", children: "None" })] }), _jsx("span", { style: fieldHint, children: t('settings.secureHint') })] })] }), _jsxs(FieldGroup, { label: t('settings.username'), children: [_jsx("input", { style: input, value: settings.username, onChange: event => patch({ username: event.target.value }) }), _jsx("div", { style: fieldHint, children: t('settings.usernameHint') })] }), _jsx(FieldGroup, { label: t('settings.password'), children: _jsx("input", { style: input, type: "password", value: password, placeholder: t('settings.passwordHint'), onChange: event => setPassword(event.target.value) }) }), _jsxs("div", { style: inlineRow, children: [_jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.from') }), _jsx("input", { style: input, value: settings.from, onChange: event => patch({ from: event.target.value }) }), _jsx("span", { style: fieldHint, children: t('settings.fromHint') })] }), _jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.recipient') }), _jsx("input", { style: input, value: settings.defaultRecipient, onChange: event => patch({ defaultRecipient: event.target.value }) }), _jsx("span", { style: fieldHint, children: t('settings.recipientHint') })] })] }), _jsxs(FieldGroup, { label: t('settings.style'), children: [_jsxs("select", { style: input, value: settings.style, onChange: event => patch({ style: event.target.value }), children: [_jsx("option", { value: "detailed", children: t('settings.detailed') }), _jsx("option", { value: "brief", children: t('settings.brief') })] }), _jsx("div", { style: fieldHint, children: t('settings.styleHint') })] }), _jsxs("div", { style: footer, children: [_jsx("button", { type: "button", style: saveBtn, onClick: onSave, disabled: saving, children: saving ? t('settings.saving') : t('settings.save') }), message !== null && _jsx("span", { style: statusText, role: "status", children: message })] })] }))] }));
}
//# sourceMappingURL=EmailSettingsSection.js.map