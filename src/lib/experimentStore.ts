import { db, type ExperimentRecord, type FileRecord, type DatasetRecord } from './db';

// ─── Experiment CRUD ─────────────────────────────────────────────

/** Create a new experiment. Returns the auto-generated ID. */
export async function createExperiment(data: Omit<ExperimentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const now = new Date().toISOString();
  
  // Create experiment entirely within a transaction
  return db.transaction('rw', db.experiments, async () => {
    return await db.experiments.add({
      ...data,
      created_at: now,
      updated_at: now,
    } as Omit<ExperimentRecord, 'id'>);
  });
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
  await db.transaction('rw', db.experiments, db.images, db.datasets, async () => {
    await db.images.where({ experiment_id: experimentId }).delete();
    await db.datasets.where({ experiment_id: experimentId }).delete();
    await db.experiments.delete(existing.id!);
  });
}

// ─── File CRUD ───────────────────────────────────────────────────

/** Save a file blob linked to an experiment. Returns the file record ID. */
export async function saveFile(
  experimentId: number,
  experiment_id: string,
  category: string,
  file: File
): Promise<number> {
  if (category === 'dataset') {
    // Process text-based dataset
    let parsedData: any[] = [];
    let rawText = '';
    
    // We only try to read text files
    if (file.name.match(/\.(txt|csv|dat|asc)$/i)) {
      rawText = await file.text();
      const lines = rawText.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/[\s,;]+/);
        if (parts.length >= 2) {
          const x = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          if (!isNaN(x) && !isNaN(y)) {
            parsedData.push({ x, y });
          }
        }
      }
    }
    
    return db.transaction('rw', db.datasets, async () => {
      return await db.datasets.add({
        experiment_id,
        category,
        fileName: file.name,
        rawText,
        parsedData,
        createdAt: new Date().toISOString(),
      });
    });
  } else {
    return db.transaction('rw', db.images, async () => {
      return await db.images.add({
        experiment_id,
        category,
        fileName: file.name,
        mimeType: file.type,
        blob: file,
        createdAt: new Date().toISOString(),
      });
    });
  }
}

/** Get a single file record by ID. */
export async function getFile(id: number): Promise<FileRecord | undefined> {
  return db.images.get(id);
}

/** Get all files for an experiment. */
export async function getFilesForExperiment(
  experimentId: number, // Legacy argument
  category?: string,
  experiment_id?: string
): Promise<FileRecord[]> {
  if (!experiment_id) return []; // We require experiment_id in the new schema
  
  let collection = db.images.where('experiment_id').equals(experiment_id);
  const all = await collection.toArray();
  if (category) return all.filter(f => f.category === category);
  return all;
}

/** Delete a single file by ID. */
export async function deleteFile(id: number): Promise<void> {
  await db.images.delete(id);
}

/** Delete all files for an experiment in a specific category. */
export async function deleteFilesByCategory(
  experimentId: number,
  category: string,
  experiment_id: string
): Promise<number> {
  if (category === 'dataset') {
    const files = await db.datasets.where('experiment_id').equals(experiment_id).toArray();
    const ids = files.map(f => f.id!).filter(Boolean);
    await db.datasets.bulkDelete(ids);
    return ids.length;
  } else {
    const files = await getFilesForExperiment(experimentId, category, experiment_id);
    const ids = files.map(f => f.id!).filter(Boolean);
    await db.images.bulkDelete(ids);
    return ids.length;
  }
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
  const images = await db.images.toArray();
  const datasets = await db.datasets.toArray();

  // Convert Blobs to base64 strings for JSON serialization
  const fileData = await Promise.all(
    images.map(async (f) => {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(f.blob);
      });
      return { ...f, blob: base64 };
    })
  );

  const data = {
    version: 2,
    exportDate: new Date().toISOString(),
    experiments,
    images: fileData,
    datasets,
  };

  return JSON.stringify(data);
}

/** Import logbook data from a JSON string. */
export async function importLogbook(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  if (!data.experiments) throw new Error('Invalid logbook data');

  // Handle version 1 migration structure where we had 'files'
  const inImages = data.images || (data.files ? data.files.filter((f: any) => f.category !== 'dataset') : []);
  const inDatasets = data.datasets || [];

  const processedFiles = await Promise.all(
    inImages.map(async (f: any) => {
      const { blob: base64, ...fileMetadata } = f;
      try {
        const res = await fetch(base64);
        const blob = await res.blob();
        return { ...fileMetadata, blob };
      } catch (err) {
        console.error(`Failed to process file ${f.fileName}:`, err);
        return { ...fileMetadata, blob: new Blob([]) };
      }
    })
  );

  await db.transaction('rw', [db.experiments, db.images, db.datasets], async () => {
    // 1. Process experiments
    for (const exp of data.experiments) {
      const { id, ...expData } = exp;
      
      const existingExp = await db.experiments.where('experiment_id').equals(exp.experiment_id).first();
      let internalId: number;
      if (existingExp && existingExp.id) {
         await db.experiments.update(existingExp.id, expData);
         internalId = existingExp.id;
      } else {
         internalId = await db.experiments.add(expData as Omit<ExperimentRecord, 'id'>);
      }
    }

    // 2. Process images
    for (const img of processedFiles) {
       const existingImg = await db.images
         .where({ experiment_id: img.experiment_id })
         .and(x => x.fileName === img.fileName && x.category === img.category)
         .first();
       
       if (existingImg && existingImg.id) {
         await db.images.update(existingImg.id, img);
       } else {
         await db.images.add(img);
       }
    }

    // 3. Process datasets
    for (const ds of inDatasets) {
       const existingDs = await db.datasets
         .where({ experiment_id: ds.experiment_id })
         .and(x => x.fileName === ds.fileName)
         .first();
       
       if (existingDs && existingDs.id) {
         await db.datasets.update(existingDs.id, ds);
       } else {
         await db.datasets.add(ds);
       }
    }
  });
}
