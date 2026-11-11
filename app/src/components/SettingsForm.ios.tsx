import { Button, Form, Host, HStack, LabeledContent, Picker, Section, Spacer, Text } from '@expo/ui/swift-ui';
import { foregroundStyle, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import type { SettingsFormProps } from './SettingsForm';
import { t } from '../i18n';

// Real SwiftUI Form: system fonts, grouped-inset rows and menu pickers exactly like the Settings app.
// The drivers' labels are in French: translated here.
export default function SettingsForm({ sections, values, camera, firmware, battery, actionValues, onSelect, onAction }: SettingsFormProps) {
  return (
    <Host style={{ flex: 1 }}>
      <Form>
        {sections.map((sec) => (
          <Section
            key={sec.title}
            title={t(sec.title)}
            footer={sec.footer ? <Text>{t(sec.footer)}</Text> : sec.title === 'WiFi' ? <Text>{t('Après modification, redémarrez la caméra puis rejoignez le nouveau réseau.')}</Text> : undefined}
          >
            {sec.items.map((it) =>
              'options' in it ? (
                <Picker
                  // Remount when the option list changes (the camera's menu arrives after the static one):
                  // SwiftUI keeps showing a blank label if the tags change under an existing Picker.
                  key={`${it.cmd}:${it.options.map((o) => o.value).join()}`}
                  label={t(it.label)}
                  selection={values[String(it.cmd)] ?? null}
                  onSelectionChange={(i: number | null) => i !== null && onSelect(it, i)}
                  modifiers={[pickerStyle('menu')]}
                >
                  {it.options.map((o) => <Text key={o.value} modifiers={[tag(o.value)]}>{t(o.label)}</Text>)}
                </Picker>
              ) : actionValues[it.cmd] ? (
                // Settings-app style row: label + current value in secondary, tappable to edit
                <Button key={it.cmd} onPress={() => onAction(it)}>
                  <HStack>
                    <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'primary' })]}>{t(it.label)}</Text>
                    <Spacer />
                    <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>{actionValues[it.cmd]!}</Text>
                  </HStack>
                </Button>
              ) : (
                <Button key={it.cmd} label={t(it.label)} role={it.action === 'confirm' ? 'destructive' : 'default'} onPress={() => onAction(it)} />
              ),
            )}
          </Section>
        ))}
        <Section title={t('Informations')}>
          <LabeledContent label={t('Caméra')}>
            <Text>{camera}</Text>
          </LabeledContent>
          <LabeledContent label={t('Batterie')}>
            <Text>{t(battery)}</Text>
          </LabeledContent>
          <LabeledContent label={t('Version du firmware')}>
            <Text>{firmware}</Text>
          </LabeledContent>
        </Section>
      </Form>
    </Host>
  );
}
