import Dexie, { type Table } from 'dexie';

// ─── Experiment record stored in IndexedDB ───────────────────────
export interface ExperimentRecord {
  id?: number;                       // auto-incremented PK
  experiment_id: string;             // human-readable ID like EXP-V2-0042
  userId: string;                    // owner (from auth)
  title: string;
  date: string;                      // ISO date string
  start_time: string;
  end_time?: string;
  researcher: string;
  collaborators?: string;
  lab_system: string;
  technique: string;
  status: string;
  objective_short: string;
  motivation?: string;
  research_question?: string;
  expected_outcome?: string;
  related_previous_experiment_id?: string;
  tags?: string;

  // Sample (embedded)
  sample: {
    sample_id: string;
    sample_name: string;
    chemical_formula?: string;
    sample_type: string;
    growth_method?: string;
    orientation?: string;
    dimensions?: string;
    thickness?: string;
    substrate?: string;
    preparation_notes?: string;
    mounting_notes?: string;
    storage_notes?: string;
  };

  // Module selection
  module_selection: {
    temperature_enabled: boolean;
    pressure_enabled: boolean;
    polarization_enabled: boolean;
    magnetic_field_enabled?: boolean;
    angle_enabled?: boolean;
    time_enabled?: boolean;
    laser_power_enabled?: boolean;
    wavelength_enabled?: boolean;
    mapping_enabled: boolean;
  };

  // Optional module data (stored inline if enabled)
  temperature_module?: {
    enabled: boolean;
    start_temperature_K: number;
    end_temperature_K: number;
    temperature_step_K: number;
    scan_direction: string;
  };
  pressure_module?: {
    enabled: boolean;
    start_pressure_GPa: number;
    end_pressure_GPa: number;
    pressure_step_GPa: number | null;
    cell_type: string;
    pressure_medium: string;
    pressure_calibration_method: string;
  };
  polarization_module?: {
    enabled: boolean;
    selected_polarizations: string;
    custom_polarization_optional?: string | null;
    crystal_orientation_reference: string;
    alignment_notes?: string;
  };
  laser_optics_module?: {
    laser_wavelength_nm: number;
    laser_power_mW?: number;
    objective: string;
    grating: string;
    spectrometer: string;
  };
  mapping_module?: Record<string, unknown>;

  // Timeline & datasets (metadata only – actual files in `files` table)
  timeline_entries: Array<{
    entry_id: string;
    timestamp: string;
    author: string;
    entry_type: string;
    text: string;
    image_attachments?: string;
  }>;

  datasets: Array<{
    dataset_id: string;
    dataset_group_name?: string;
    run_name: string;
    file_name: string;
    file_type: string;
    acquisition_timestamp?: string;
    temperature_K?: number;
    pressure_GPa?: number;
    polarization?: string;
    magnetic_field_T?: number;
    angle_deg?: number;
    laser_wavelength_nm?: number;
    laser_power_mW?: number;
    integration_time_s?: number;
    accumulations?: number;
    scan_order?: number;
    quality_flag: string;
    comments?: string;
    tags?: string;
  }>;

  // Reflections
  general_setup_notes?: string;
  preliminary_impression?: string;
  challenges_faced?: string;
  things_to_improve?: string;
  things_that_worked_nicely?: string;
  final_summary?: string;
  conclusions?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ─── File blob stored in IndexedDB ───────────────────────────────
export interface FileRecord {
  id?: number;                       // auto-incremented PK
  experiment_id: string;             // human-readable experiment ID
  category: string;                  // 'dataset' | 'sample_image' | 'reflection_image' | 'note_image'
  fileName: string;
  mimeType: string;
  blob: Blob;
  createdAt: string;
}

export interface DatasetRecord {
  id?: number;
  experiment_id: string;
  fileName: string;
  rawText?: string;
  parsedData?: any[];
  category: string;
  createdAt: string;
}

export interface MetadataRecord {
  key: string;
  value: any;
  updatedAt: string;
}

// ─── Dexie database definition ───────────────────────────────────
class LogbookDB extends Dexie {
  experiments!: Table<ExperimentRecord>;
  datasets!: Table<DatasetRecord>;
  images!: Table<FileRecord>;
  metadata!: Table<MetadataRecord>;

  constructor() {
    super('physicsLogbook');

    this.version(2).stores({
      experiments: '++id, experiment_id, userId, date, technique, tags, [userId+date]',
      images: '++id, experiment_id, category, fileName',
      datasets: '++id, experiment_id, category, fileName',
      metadata: 'key'
    });
  }

  // Backup and integrity functions
  async performBackup(label: string = 'backup') {
    try {
      const allExps = await this.experiments.toArray();
      const allImages = await this.images.toArray();
      const allDatasets = await this.datasets.toArray();
      
      const backupData = {
        timestamp: new Date().toISOString(),
        experiments: allExps,
        images: allImages,
        datasets: allDatasets
      };

      await this.metadata.put({
        key: label,
        value: backupData,
        updatedAt: new Date().toISOString()
      });
      console.log(`Successfully backed up database under label: ${label}`);
    } catch (err) {
      console.error('Backup failed', err);
    }
  }

  async verifyIntegrityAndRestore() {
    try {
      const expCount = await this.experiments.count();
      // Heuristic: If experiments count is 0 but we have a backup, it might have been cleared
      if (expCount === 0) {
        console.warn('Database appears empty, checking for backup...');
        const backup = await this.metadata.get('backup_1');
        if (backup && backup.value && backup.value.experiments) {
          console.log('Restoring from backup_1...');
          await this.transaction('rw', this.experiments, this.images, this.datasets, async () => {
            await this.experiments.bulkAdd(backup.value.experiments);
            if (backup.value.images) await this.images.bulkAdd(backup.value.images);
            if (backup.value.datasets) await this.datasets.bulkAdd(backup.value.datasets);
          });
          console.log('Restore complete.');
          return true;
        }
      }
      return true;
    } catch (err) {
      console.error('Integrity check failed', err);
      return false;
    }
  }
}

export const db = new LogbookDB();

// Run integrity check on mount
if (typeof window !== 'undefined') {
  db.verifyIntegrityAndRestore().then(() => {
    // Take a daily backup
    db.performBackup('backup_1');
  });
}
