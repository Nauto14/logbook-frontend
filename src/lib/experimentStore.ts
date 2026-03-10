import { db, type ExperimentRecord, type FileRecord } from './db';

// ─── Experiment CRUD ─────────────────────────────────────────────

/** Create a new experiment. Returns the auto-generated ID. */
export async function createExperiment(data: Omit<ExperimentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const now = new Date().toISOString();
  return db.experiments.add({
    ...data,
    created_at: now,
    updated_at: now,
  } as ExperimentRecord);
}

/** Get all experiments for a user, newest first. */
export async function getExperiments(userId: string): Promise<ExperimentRecord[]> {
  return db.experiments
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('created_at');
}

/** Get a single experiment by its human-readable experiment_id. */
export async function getExperiment(experimentId: string): Promise<ExperimentRecord | undefined> {
  return db.experiments.where('experiment_id').equals(experimentId).first();
}

/** Get a single experiment by its numeric PK. */
export async function getExperimentById(id: number): Promise<ExperimentRecord | undefined> {
  return db.experiments.get(id);
}

/** Update an experiment. */
export async function updateExperiment(
  experimentId: string,
  updates: Partial<ExperimentRecord>
): Promise<number> {
  const existing = await getExperiment(experimentId);
  if (!existing || !existing.id) throw new Error('Experiment not found');
  return db.experiments.update(existing.id, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

/** Delete an experiment and all its files. */
export async function deleteExperiment(experimentId: string): Promise<void> {
  const existing = await getExperiment(experimentId);
  if (!existing || !existing.id) return;
  await db.files.where('experimentId').equals(existing.id).delete();
  await db.experiments.delete(existing.id);
}

// ─── File CRUD ───────────────────────────────────────────────────

/** Save a file blob linked to an experiment. Returns the file record ID. */
export async function saveFile(
  experimentId: number,
  experiment_id: string,
  category: string,
  file: File
): Promise<number> {
  return db.files.add({
    experimentId,
    experiment_id,
    category,
    fileName: file.name,
    mimeType: file.type,
    blob: file,
    createdAt: new Date().toISOString(),
  });
}

/** Get a single file record by ID. */
export async function getFile(id: number): Promise<FileRecord | undefined> {
  return db.files.get(id);
}

/** Get all files for an experiment. */
export async function getFilesForExperiment(
  experimentId: number,
  category?: string
): Promise<FileRecord[]> {
  let collection = db.files.where('experimentId').equals(experimentId);
  const all = await collection.toArray();
  if (category) return all.filter(f => f.category === category);
  return all;
}

/** Delete a single file by ID. */
export async function deleteFile(id: number): Promise<void> {
  await db.files.delete(id);
}

/** Delete all files for an experiment in a specific category. */
export async function deleteFilesByCategory(
  experimentId: number,
  category: string
): Promise<number> {
  const files = await getFilesForExperiment(experimentId, category);
  const ids = files.map(f => f.id!).filter(Boolean);
  await db.files.bulkDelete(ids);
  return ids.length;
}

// ─── Search ──────────────────────────────────────────────────────

/** Search experiments by text across title, sample name, tags, technique, and notes. */
export async function searchExperiments(
  userId: string,
  query: string
): Promise<ExperimentRecord[]> {
  const q = query.toLowerCase();
  const all = await getExperiments(userId);
  return all.filter(exp => {
    const searchable = [
      exp.title,
      exp.experiment_id,
      exp.technique,
      exp.tags,
      exp.sample?.sample_name,
      exp.sample?.chemical_formula,
      exp.objective_short,
      exp.motivation,
      exp.research_question,
      exp.conclusions,
      exp.final_summary,
      exp.preliminary_impression,
      exp.general_setup_notes,
      ...(exp.timeline_entries || []).map(t => t.text),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return searchable.includes(q);
  });
}

/** Get experiments for AI context – returns a simplified summary array. */
export async function getExperimentsForAI(userId: string): Promise<Record<string, unknown>[]> {
  const experiments = await getExperiments(userId);
  return experiments.map(exp => ({
    experiment_id: exp.experiment_id,
    title: exp.title,
    date: exp.date,
    technique: exp.technique,
    researcher: exp.researcher,
    sample_name: exp.sample?.sample_name,
    chemical_formula: exp.sample?.chemical_formula,
    sample_type: exp.sample?.sample_type,
    objective: exp.objective_short,
    motivation: exp.motivation,
    tags: exp.tags,
    status: exp.status,
    conclusions: exp.conclusions,
    final_summary: exp.final_summary,
    preliminary_impression: exp.preliminary_impression,
    challenges_faced: exp.challenges_faced,
    things_that_worked_nicely: exp.things_that_worked_nicely,
    temperature: exp.temperature_module,
    pressure: exp.pressure_module,
    polarization: exp.polarization_module,
    timeline_notes: exp.timeline_entries?.map(t => `[${t.timestamp}] ${t.text}`).join('\n'),
    datasets_count: exp.datasets?.length || 0,
    datasets_summary: exp.datasets?.map(d =>
      `${d.file_name} (${d.quality_flag})${d.temperature_K ? ` ${d.temperature_K}K` : ''}${d.pressure_GPa ? ` ${d.pressure_GPa}GPa` : ''}`
    ).join(', '),
  }));
}

// ─── Backup & Restore ─────────────────────────────────────────────

/** Export the entire logbook (experiments and files) as a JSON-serializable object. */
export async function exportLogbook(): Promise<string> {
  const experiments = await db.experiments.toArray();
  const files = await db.files.toArray();

  // Convert Blobs to base64 strings for JSON serialization
  const fileData = await Promise.all(
    files.map(async (f) => {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(f.blob);
      });
      return { ...f, blob: base64 };
    })
  );

  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    experiments,
    files: fileData,
  };

  return JSON.stringify(data);
}

/** Import logbook data from a JSON string. */
export async function importLogbook(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  if (!data.experiments || !data.files) throw new Error('Invalid logbook data');

  await db.transaction('rw', [db.experiments, db.files], async () => {
    // Clear existing data? Spec doesn't say, but usually safer to merge or clear.
    // Let's merge by checking experiment_id.
    
    for (const exp of data.experiments) {
      const { id, ...expData } = exp;
      const existing = await db.experiments.where('experiment_id').equals(exp.experiment_id).first();
      let internalId: number;
      if (existing && existing.id) {
        await db.experiments.update(existing.id, expData);
        internalId = existing.id;
      } else {
        internalId = await db.experiments.add(expData);
      }

      // Match files for this experiment
      const expFiles = data.files.filter((f: any) => f.experiment_id === exp.experiment_id);
      for (const f of expFiles) {
        const { id: fid, experimentId: feid, blob: base64, ...fileMetadata } = f;
        
        // Convert base64 back to Blob
        const res = await fetch(base64);
        const blob = await res.blob();

        const existingFile = await db.files
          .where('experiment_id').equals(exp.experiment_id)
          .and(x => x.fileName === f.fileName && x.category === f.category)
          .first();

        if (existingFile && existingFile.id) {
          await db.files.update(existingFile.id, { ...fileMetadata, blob, experimentId: internalId });
        } else {
          await db.files.add({ ...fileMetadata, blob, experimentId: internalId });
        }
      }
    }
  });
}
