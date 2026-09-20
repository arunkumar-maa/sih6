import { supabase } from '../src/services/supabase.service.js';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const scriptsDir = path.resolve(process.cwd(), 'scripts');
  const files = fs.readdirSync(scriptsDir)
    .filter(f => f.startsWith('seed_mp_batch_') && f.endsWith('.sql'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('seed_mp_batch_', '').replace('.sql', ''), 10);
      const numB = parseInt(b.replace('seed_mp_batch_', '').replace('.sql', ''), 10);
      return numA - numB;
    });

  console.log(`[Apply MP Seeds] Found ${files.length} batch files to execute.`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(scriptsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    process.stdout.write(`Executing ${file} (${i + 1}/${files.length})... `);
    const { error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      console.log('FAILED!');
      console.error(error);
      process.exit(1);
    } else {
      console.log('DONE');
    }
  }

  console.log('[Apply MP Seeds] All MP batches successfully applied!');

  // Verify counts
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  console.log(`[Apply MP Seeds] Total profiles in database: ${userCount}`);
}

run().catch(err => {
  console.error('[Apply MP Seeds Error]:', err);
  process.exit(1);
});
