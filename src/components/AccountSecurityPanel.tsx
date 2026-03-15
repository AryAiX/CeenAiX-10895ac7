import { useState } from 'react';
import { AlertTriangle, KeyRound, ShieldAlert, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';

interface AccountSecurityPanelProps {
  tone?: 'patient' | 'doctor';
}

export const AccountSecurityPanel = ({ tone = 'patient' }: AccountSecurityPanelProps) => {
  const navigate = useNavigate();
  const { updatePassword, signOut } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const headerClass =
    tone === 'doctor'
      ? 'bg-gradient-to-r from-teal-600 to-emerald-600'
      : 'bg-gradient-to-r from-blue-600 to-cyan-600';
  const focusClass =
    tone === 'doctor'
      ? 'focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
      : 'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20';
  const primaryButtonClass =
    tone === 'doctor'
      ? 'bg-teal-600 hover:bg-teal-700'
      : 'bg-blue-600 hover:bg-blue-700';

  const handlePasswordUpdate = async () => {
    setPasswordError(null);
    setPasswordMessage(null);

    if (password.length < 8) {
      setPasswordError('Use at least 8 characters for your new password.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('The password confirmation does not match.');
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await updatePassword(password);
    setIsUpdatingPassword(false);

    if (error) {
      setPasswordError(error.message);
      return;
    }

    setPassword('');
    setConfirmPassword('');
    setPasswordMessage('Your password has been updated.');
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);

    if (deleteConfirmation !== 'DELETE') {
      setDeleteError('Type DELETE to confirm account deletion.');
      return;
    }

    const shouldDelete = window.confirm(
      'Delete this account now? This cannot be undone. Accounts with clinical or shared care data cannot self-delete.'
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeletingAccount(true);
    const { error } = await supabase.rpc('delete_current_user_account');

    if (error) {
      setDeleteError(error.message);
      setIsDeletingAccount(false);
      return;
    }

    await signOut();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100/50 bg-white shadow-xl">
      <div className={`p-6 ${headerClass}`}>
        <div className="flex items-center space-x-4">
          <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">Account Security</h3>
            <p className="mt-1 text-sm text-white/85">
              Update your password or remove a test account that has no retained care data.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-8">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="mb-5 flex items-center space-x-3">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <KeyRound className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Change password</h4>
              <p className="text-sm text-gray-600">Use a new password for future sign-ins.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">New password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all ${focusClass}`}
                placeholder="Enter a new password"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={`w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all ${focusClass}`}
                placeholder="Confirm the new password"
              />
            </div>
          </div>

          {passwordError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {passwordError}
            </div>
          ) : null}

          {passwordMessage ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {passwordMessage}
            </div>
          ) : null}

          <button
            onClick={handlePasswordUpdate}
            disabled={isUpdatingPassword}
            className={`mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${primaryButtonClass}`}
          >
            {isUpdatingPassword ? 'Updating password...' : 'Update password'}
          </button>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="mb-5 flex items-center space-x-3">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Delete account</h4>
              <p className="text-sm text-gray-600">
                For safety, self-delete only works for accounts without clinical or shared care data.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Type <span className="font-bold">DELETE</span> to confirm. If you already have appointments,
                prescriptions, records, or shared care threads, contact support instead of self-deleting.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Confirmation</label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              className={`w-full rounded-xl border-2 border-red-200 bg-white px-4 py-3 transition-all ${focusClass}`}
              placeholder='Type "DELETE" to continue'
            />
          </div>

          {deleteError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700">
              {deleteError}
            </div>
          ) : null}

          <button
            onClick={handleDeleteAccount}
            disabled={isDeletingAccount}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeletingAccount ? 'Deleting account...' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  );
};
