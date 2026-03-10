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
  temperature_module?: Record<string, unknown>;
  pressure_module?: Record<string, unknown>;
  polarization_module?: Record<string, unknown>;
  laser_optics_module?: Record<string, unknown>;
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
  experimentId: number;              // FK → ExperimentRecord.id
  experiment_id: string;             // human-readable experiment ID
  category: string;                  // 'dataset' | 'sample_image' | 'reflection_image' | 'note_image'
  fileName: string;
  mimeType: string;
  blob: Blob;
  createdAt: string;
}

// ─── Dexie database definition ───────────────────────────────────
class LogbookDB extends Dexie {
  experiments!: Table<ExperimentRecord>;
  files!: Table<FileRecord>;

  constructor() {
    super('LogbookDB');

    this.version(1).stores({
      experiments: '++id, experiment_id, userId, date, technique, tags, [userId+date]',
      files: '++id, experimentId, experiment_id, category, fileName',
    });
  }
}

export const db = new LogbookDB();
