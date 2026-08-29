import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Email-summary plugin configuration card (shown in Settings → Plugins).
 * Collapsed by default, mirroring the shared PluginCard chrome so it sits
 * beside the built-in shell / agent-loop / web-search cards identically.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
 */
import { useCallback, useEffect, useState } from 'react';
import { IconChevronDownOutline14 } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './EmailCard.module.css';
const groupLabel = { fontSize: 12, fontWeight: 600, color: '#2563eb', marginBottom: 2 };
const fieldLabel = { fontSize: 13, fontWeight: 500 };
const fieldHint = { fontSize: 11, opacity: 0.55 };
const input = {
    padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.18)',
    fontSize: 14, background: '#fff', width: '100%',
};
const inlineRow = { display: 'flex', gap: 14 };
const inlineCol = { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 };
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
    const [defaultPrompts, setDefaultPrompts] = useState({ brief: '', detailed: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    useEffect(() => {
        let alive = true;
        void api.getSettings().then((result) => {
            if (!alive)
                return;
            setPresets(result.presets);
            setDefaultPrompts(result.defaultPrompts);
            // Pre-fill the prompt with the effective prompt (custom if set, else the
            // default for the current style) so the user can see and edit it.
            const style = result.settings.style === 'brief' ? 'brief' : 'detailed';
            setSettings({
                ...result.settings,
                prompt: (result.settings.prompt ?? '').trim() !== ''
                    ? result.settings.prompt
                    : result.defaultPrompts[style],
            });
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
    const restoreDefaultPrompt = useCallback(() => {
        if (settings === null)
            return;
        const style = settings.style === 'brief' ? 'brief' : 'detailed';
        const def = defaultPrompts[style];
        if (def !== '')
            setSettings(current => (current === null ? current : { ...current, prompt: def }));
    }, [settings, defaultPrompts]);
    const onStyleChange = useCallback((nextStyle) => {
        setSettings(current => {
            if (current === null)
                return current;
            const style = nextStyle === 'brief' ? 'brief' : 'detailed';
            const currentPrompt = (current.prompt ?? '').trim();
            const isDefault = currentPrompt === ''
                || currentPrompt === defaultPrompts.brief.trim()
                || currentPrompt === defaultPrompts.detailed.trim();
            return { ...current, style, prompt: isDefault ? (defaultPrompts[style] ?? current.prompt) : current.prompt };
        });
    }, [defaultPrompts]);
    const onSave = useCallback(() => {
        if (settings === null || saving)
            return;
        setSaving(true);
        setMessage(null);
        void (async () => {
            // A prompt that is empty or equals the selected style's built-in default
            // is stored empty, so the summarizer keeps following the style default.
            const style = settings.style === 'brief' ? 'brief' : 'detailed';
            const def = (defaultPrompts[style] ?? '').trim();
            const promptText = (settings.prompt ?? '').trim();
            const customPrompt = promptText === '' || promptText === def ? '' : settings.prompt;
            const patchValue = { ...settings, prompt: customPrompt };
            const saved = await api.saveSettings({ patch: patchValue });
            if (password !== '')
                await api.setPassword({ password });
            setSaving(false);
            setMessage(saved.ok ? t('settings.saved') : (saved.error ?? t('settings.error')));
        })();
    }, [settings, saving, password, defaultPrompts, api, t]);
    const discard = useCallback(() => {
        if (saving)
            return;
        setMessage(null);
        void api.getSettings().then((result) => {
            const style = result.settings.style === 'brief' ? 'brief' : 'detailed';
            setSettings({
                ...result.settings,
                prompt: (result.settings.prompt ?? '').trim() !== ''
                    ? result.settings.prompt
                    : result.defaultPrompts[style],
            });
            setPresets(result.presets);
            setDefaultPrompts(result.defaultPrompts);
            setPassword('');
        });
    }, [saving, api]);
    if (settings === null)
        return null;
    return (_jsxs("li", { className: open ? `${css.card} ${css.cardOpen}` : css.card, children: [_jsxs("button", { type: "button", className: css.header, "aria-expanded": open, onClick: () => { setOpen(!open); }, children: [_jsxs("span", { className: css.headText, children: [_jsx("span", { className: css.name, children: t('nav') }), _jsx("span", { className: css.description, children: t('desc') })] }), _jsx(IconChevronDownOutline14, { className: open ? `${css.chevron} ${css.chevronOpen}` : css.chevron })] }), open && (_jsxs("div", { className: css.body, children: [_jsx(FieldGroup, { label: t('settings.provider'), children: _jsx("select", { style: input, value: settings.provider, onChange: event => onProvider(event.target.value), children: presets.map(preset => _jsx("option", { value: preset.id, children: preset.label }, preset.id)) }) }), _jsxs(FieldGroup, { label: t('settings.host'), children: [_jsx("input", { style: input, value: settings.smtpHost, onChange: event => patch({ smtpHost: event.target.value }) }), _jsx("div", { style: fieldHint, children: t('settings.hostHint') })] }), _jsxs("div", { style: inlineRow, children: [_jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.port') }), _jsx("input", { style: input, type: "number", value: settings.smtpPort, onChange: event => patch({ smtpPort: Number(event.target.value) }) }), _jsx("span", { style: fieldHint, children: t('settings.portHint') })] }), _jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.secure') }), _jsxs("select", { style: input, value: settings.secure, onChange: event => patch({ secure: event.target.value }), children: [_jsx("option", { value: "starttls", children: "STARTTLS" }), _jsx("option", { value: "ssl", children: "SSL" }), _jsx("option", { value: "none", children: "None" })] }), _jsx("span", { style: fieldHint, children: t('settings.secureHint') })] })] }), _jsxs(FieldGroup, { label: t('settings.username'), children: [_jsx("input", { style: input, value: settings.username, onChange: event => patch({ username: event.target.value }) }), _jsx("div", { style: fieldHint, children: t('settings.usernameHint') })] }), _jsx(FieldGroup, { label: t('settings.password'), children: _jsx("input", { style: input, type: "password", value: password, placeholder: t('settings.passwordHint'), onChange: event => setPassword(event.target.value) }) }), _jsxs("div", { style: inlineRow, children: [_jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.from') }), _jsx("input", { style: input, value: settings.from, onChange: event => patch({ from: event.target.value }) }), _jsx("span", { style: fieldHint, children: t('settings.fromHint') })] }), _jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.recipient') }), _jsx("input", { style: input, value: settings.defaultRecipient, onChange: event => patch({ defaultRecipient: event.target.value }) }), _jsx("span", { style: fieldHint, children: t('settings.recipientHint') })] })] }), _jsxs(FieldGroup, { label: t('settings.style'), children: [_jsxs("select", { style: input, value: settings.style, onChange: event => onStyleChange(event.target.value), children: [_jsx("option", { value: "detailed", children: t('settings.detailed') }), _jsx("option", { value: "brief", children: t('settings.brief') })] }), _jsx("div", { style: fieldHint, children: t('settings.styleHint') })] }), _jsxs(FieldGroup, { label: t('settings.prompt'), children: [_jsx("textarea", { style: { ...input, minHeight: 120, resize: 'vertical', fontFamily: 'ui-monospace,Consolas,monospace', fontSize: 13, lineHeight: 1.5 }, value: settings.prompt, placeholder: t('settings.promptPlaceholder'), onChange: event => patch({ prompt: event.target.value }) }), _jsx("div", { style: fieldHint, children: t('settings.promptHint') }), _jsx("button", { type: "button", style: { padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'transparent', color: '#2563eb', fontSize: 12, cursor: 'pointer', alignSelf: 'flex-start' }, onClick: restoreDefaultPrompt, children: t('settings.restoreDefaultPrompt') })] }), _jsxs(FieldGroup, { label: t('settings.report'), children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("input", { type: "checkbox", checked: settings.reportEnabled, onChange: event => patch({ reportEnabled: event.target.checked }) }), _jsx("span", { style: fieldLabel, children: t('settings.reportEnabled') })] }), _jsx("div", { style: fieldHint, children: t('settings.reportHint') }), settings.reportEnabled && (_jsxs(_Fragment, { children: [_jsxs("div", { style: inlineRow, children: [_jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.reportFrequency') }), _jsxs("select", { style: input, value: settings.reportFrequency, onChange: event => patch({ reportFrequency: event.target.value }), children: [_jsx("option", { value: "daily", children: t('settings.daily') }), _jsx("option", { value: "weekly", children: t('settings.weekly') })] })] }), _jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.reportTime') }), _jsx("input", { style: input, value: settings.reportTime, placeholder: "09:00", onChange: event => patch({ reportTime: event.target.value }) }), _jsx("span", { style: fieldHint, children: t('settings.reportTimeHint') })] })] }), settings.reportFrequency === 'weekly' && (_jsxs("label", { style: inlineCol, children: [_jsx("span", { style: fieldLabel, children: t('settings.reportWeekday') }), _jsx("select", { style: input, value: settings.reportWeekday, onChange: event => patch({ reportWeekday: Number(event.target.value) }), children: t('settings.weekdays').split(',').map((label, idx) => (_jsx("option", { value: idx, children: label }, idx))) })] }))] }))] }), _jsxs("div", { className: css.footer, children: [message !== null && _jsx("span", { className: css.failed, role: "status", children: message }), _jsx("button", { type: "button", className: css.discard, onClick: discard, disabled: saving, children: t('settings.discard') }), _jsx("button", { type: "button", className: css.save, onClick: onSave, disabled: saving, children: saving ? t('settings.saving') : t('settings.save') })] })] }))] }));
}
//# sourceMappingURL=EmailSettingsSection.js.map