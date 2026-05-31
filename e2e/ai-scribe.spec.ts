import { expect, test } from '@playwright/test';
import { installSupabaseMocks, seedAuthenticatedRole } from './support/supabase-mock';
import {
  SCRIBE_APPOINTMENT_ID,
  installScribeRoutes,
  sampleNote,
  sampleRecording,
  sampleTranscript,
  type ScribeState,
} from './support/scribe-mock';

test.describe('AI Consultation Scribe', () => {
  test('shows a processed AI clinical note with editable SOAP and smart suggestions', async ({ browser }) => {
    const page = await browser.newPage();
    await installSupabaseMocks(page, { role: 'doctor' });
    const state: ScribeState = {
      recording: sampleRecording('ready'),
      transcript: sampleTranscript(),
      note: sampleNote(),
    };
    await installScribeRoutes(page, state);
    await seedAuthenticatedRole(page, 'doctor');

    await page.goto(`/doctor/appointments/${SCRIBE_APPOINTMENT_ID}`);

    await expect(page.getByText('Ready for review')).toBeVisible();

    await page.getByRole('button', { name: 'AI Scribe' }).click();

    await expect(page.getByText('Acute bronchitis').first()).toBeVisible();
    await expect(page.getByText('J20.9')).toBeVisible();
    await expect(page.getByText('AI-generated').first()).toBeVisible();
    await expect(page.getByText('I have had chest tightness').first()).toBeVisible();
    await expect(page.getByText('Low confidence').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve & Save to Record' })).toBeVisible();

    await page.close();
  });

  test('captures consent before recording can start', async ({ browser }) => {
    const page = await browser.newPage();
    await installSupabaseMocks(page, { role: 'doctor' });
    const state: ScribeState = { recording: null, transcript: null, note: null };
    await installScribeRoutes(page, state);
    await seedAuthenticatedRole(page, 'doctor');

    await page.goto(`/doctor/appointments/${SCRIBE_APPOINTMENT_ID}`);

    await page.getByRole('button', { name: 'Start Recording' }).click();

    await expect(page.getByText('Patient Consent Required')).toBeVisible();
    const confirm = page.getByRole('button', { name: 'Confirm & Start Recording' });
    await expect(confirm).toBeDisabled();

    await page.getByText('I have informed the patient').click();
    await page.getByText('The patient has given verbal consent').click();
    await expect(confirm).toBeEnabled();

    await page.close();
  });
});
