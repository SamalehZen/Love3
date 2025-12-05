import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabase';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const DebugPanel = () => {
  const { user, profile } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnectionRequest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('[DebugPanel] User connecté:', user?.id);
      console.log('[DebugPanel] Profile:', profile);
      
      if (!user) {
        setTestResult({
          type: 'error',
          message: 'Utilisateur non connecté',
          details: 'Vous devez être connecté pour envoyer des invitations'
        });
        setLoading(false);
        return;
      }

      const testData = {
        from_user_id: user.id,
        to_user_id: user.id,
        introduction_answers: [
          { question: "Test question", answer: "Test answer" }
        ]
      };

      console.log('[DebugPanel] Test insertion avec:', testData);

      const { data, error } = await supabase
        .from('connection_requests')
        .insert(testData)
        .select();

      console.log('[DebugPanel] Résultat:', { data, error });

      if (error) {
        setTestResult({
          type: 'error',
          message: error.message,
          code: error.code,
          details: error.details || error.hint || 'Pas de détails',
          fullError: JSON.stringify(error, null, 2)
        });
      } else {
        setTestResult({
          type: 'success',
          message: 'Insertion réussie !',
          data: data
        });

        await supabase
          .from('connection_requests')
          .delete()
          .eq('id', data[0].id);
        console.log('[DebugPanel] Demande de test supprimée');
      }
    } catch (err) {
      console.error('[DebugPanel] Exception:', err);
      setTestResult({
        type: 'error',
        message: (err as Error).message,
        stack: (err as Error).stack
      });
    } finally {
      setLoading(false);
    }
  };

  const testRLS = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.rpc('pg_has_role', {
        rolename: 'authenticated'
      }).single();

      console.log('[DebugPanel] Test RLS role:', { data, error });

      const queries = [
        { name: 'Profiles', query: supabase.from('profiles').select('*').limit(1) },
        { name: 'Connection Requests', query: supabase.from('connection_requests').select('*').limit(1) },
        { name: 'Conversations', query: supabase.from('conversations').select('*').limit(1) },
        { name: 'Messages', query: supabase.from('messages').select('*').limit(1) },
      ];

      const results = await Promise.all(
        queries.map(async ({ name, query }) => {
          const { data, error } = await query;
          return {
            table: name,
            success: !error,
            error: error?.message,
            count: data?.length ?? 0
          };
        })
      );

      setTestResult({
        type: 'info',
        message: 'Tests de lecture des tables',
        results: results
      });

    } catch (err) {
      console.error('[DebugPanel] Exception test RLS:', err);
      setTestResult({
        type: 'error',
        message: (err as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 w-96 bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
      <h3 className="text-white font-bold mb-3">🔧 Debug Panel</h3>
      
      <div className="space-y-2 mb-4 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">User ID:</span>
          <span className="text-white font-mono">{user?.id?.slice(0, 8)}...</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Profile:</span>
          <span className="text-white">{profile?.name || 'Aucun'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Email:</span>
          <span className="text-white">{user?.email || 'Aucun'}</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={testConnectionRequest}
          disabled={loading}
          className="w-full py-2 bg-[#FF8C42] text-black rounded-lg font-medium text-sm hover:bg-[#FF8C42]/90 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Tester Invitation'}
        </button>
        
        <button
          onClick={testRLS}
          disabled={loading}
          className="w-full py-2 bg-[#32D583] text-black rounded-lg font-medium text-sm hover:bg-[#32D583]/90 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Tester RLS'}
        </button>
      </div>

      {testResult && (
        <div className={`mt-4 p-3 rounded-lg text-xs ${
          testResult.type === 'error' ? 'bg-red-500/10 border border-red-500/20' :
          testResult.type === 'success' ? 'bg-green-500/10 border border-green-500/20' :
          'bg-blue-500/10 border border-blue-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {testResult.type === 'error' && <AlertTriangle size={16} className="text-red-400" />}
            {testResult.type === 'success' && <CheckCircle size={16} className="text-green-400" />}
            {testResult.type === 'info' && <Info size={16} className="text-blue-400" />}
            <span className={`font-bold ${
              testResult.type === 'error' ? 'text-red-400' :
              testResult.type === 'success' ? 'text-green-400' :
              'text-blue-400'
            }`}>
              {testResult.message}
            </span>
          </div>
          
          {testResult.code && (
            <p className="text-gray-400 mb-1">Code: <span className="text-red-300">{testResult.code}</span></p>
          )}
          
          {testResult.details && (
            <p className="text-gray-300 mb-2">{testResult.details}</p>
          )}
          
          {testResult.results && (
            <div className="space-y-1 mt-2">
              {testResult.results.map((r: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-400">{r.table}:</span>
                  <span className={r.success ? 'text-green-400' : 'text-red-400'}>
                    {r.success ? `✅ ${r.count} rows` : `❌ ${r.error}`}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {testResult.fullError && (
            <details className="mt-2">
              <summary className="text-gray-400 cursor-pointer">Erreur complète</summary>
              <pre className="mt-1 text-red-300 overflow-auto max-h-40 text-[10px] bg-black/50 p-2 rounded">
                {testResult.fullError}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
