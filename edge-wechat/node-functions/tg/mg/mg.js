import PocketBase from "pocketbase";

const pb = new PocketBase("https://pocket.arick.top");

pb.autoCancellation(false);

// 先以管理员身份登录
await pb
  .collection("_superusers")
  .authWithPassword("zyxlcr@qq.com", "Ps@love20140805");
// 创建 task 集合
//
const filter = `bucket="github"`;

let re = await pb.collection('tgfs_objects').getFirstListItem(filter);
console.log(re);

// 1. tasks 集合 - 主任务表
const tasksCollectionData = {
  name: 'tasks',
  type: 'base',
  fields: [
    {
      name: 'type',
      type: 'text',
      required: true,

      max: 10

    },
    {
      name: 'type_name',
      type: 'text',
      required: true,

      max: 50

    },
    {
      name: 'target_uid',
      type: 'text',
      required: true,

      max: 100

    },
    {
      name: 'status',
      type: 'text',
      required: true,
      options: {
        maxSelect: 1,
        values: ['pending', 'applied', 'failed', 'read']
      }
    },
    {
      name: 'applied_at',
      type: 'date',
      required: false
    },
    {
      name: 'retry_count',
      type: 'number',
      required: true,
      min: 0,
      max: 99

    }
  ],
  indexes: [
    'CREATE INDEX idx_tasks_target_uid ON tasks (target_uid)',
    'CREATE INDEX idx_tasks_status ON tasks (status)',
    'CREATE INDEX idx_tasks_type ON tasks (type)'
  ]
};

// 2. task_lock 集合 - 应用锁任务
const taskLockCollectionData = {
    name: 'task_lock',
    type: 'base',
    fields: [
        {
            name: 'tid',
            type: 'text',
            required: true,
        },
        {
            name: 'target_uid',
            type: 'text',
            required: true,
            max: 100

        },
        {
            name: 'type',
            type: 'text',
            required: true,

        },
        {
            name: 'package_name',
            type: 'text',
            required: true,
            max: 200

        },
        {
            name: 'is_used',
            type: 'bool',
            required: true
        },
        {
            name: 'start_time',
            type: 'text',
            required: false,
            max: 10

        },
        {
            name: 'end_time',
            type: 'text',
            required: false,
            max: 10

        }
    ],
    indexes: [
        'CREATE INDEX idx_task_lock_tid ON task_lock (tid)',
        'CREATE INDEX idx_task_lock_target_uid ON task_lock (target_uid)',
        'CREATE INDEX idx_task_lock_package ON task_lock (package_name)'
    ]
};

// 3. apps 集合 - 应用管理
const appsCollectionData = {
    name: 'apps',
    type: 'base',
    fields: [
        {
            name: 'is_used',
            type: 'bool',
            required: true
        },
        {
            name: 'target_uid',
            type: 'text',
            required: true,

                max: 100

        },
        {
            name: 'package_name',
            type: 'text',
            required: true,
            unique: true,

                max: 200

        },
        {
            name: 'name',
            type: 'text',
            required: true,

                max: 100

        }
    ],
    indexes: [
        'CREATE INDEX idx_apps_target_uid ON apps (target_uid)',
        'CREATE INDEX idx_apps_package ON apps (package_name)',
        'CREATE UNIQUE INDEX idx_apps_package_target ON apps (package_name, target_uid)'
    ]
};

// 4. task_channel 集合 - 通知任务
const taskChannelCollectionData = {
    name: 'task_channel',
    type: 'base',
    fields: [
        {
            name: 'tid',
            type: 'text',
            required: true,
        },
        {
            name: 'target_uid',
            type: 'text',
            required: true,

                max: 100

        },
        {
            name: 'title',
            type: 'text',
            required: true,
                max: 200

        },
        {
            name: 'content',
            type: 'text',
            required: true,
                max: 1000

        },
        {
            name: 'is_used',
            type: 'bool',
            required: true
        }
    ],
    indexes: [
        'CREATE INDEX idx_task_channel_tid ON task_channel (tid)',
        'CREATE INDEX idx_task_channel_target_uid ON task_channel (target_uid)'
    ]
};

// 5. task_chat 集合 - 聊天任务
const taskChatCollectionData = {
    name: 'task_chat',
    type: 'base',
    fields: [
        {
            name: 'tid',
            type: 'text',
            required: true
        },
        {
            name: 'target_uid',
            type: 'text',
            required: true,
                max: 100

        },
        {
            name: 'target_groupid',
            type: 'text',
            required: false,

                max: 100

        },
        {
            name: 'from_uid',
            type: 'text',
            required: true,

                max: 100

        },
        {
            name: 'content',
            type: 'text',
            required: true,

                max: 1000

        },
        {
            name: 'file_url',
            type: 'text',
            required: false,
            options: {
                max: 500
            }
        },
        {
            name: 'is_used',
            type: 'bool',
            required: true
        }
    ],
    // indexes: [
    //     'CREATE INDEX idx_task_chat_tid ON task_chat (tid)',
    //     'CREATE INDEX idx_task_chat_target_uid ON task_chat (target_uid)',
    //     'CREATE INDEX idx_task_chat_from_uid ON task_chat (from_uid)',
    //     'CREATE INDEX idx_task_chat_group ON task_chat (target_groupid)'
    // ]
};


let data = {
    name: 'task_channel',
    type: 'base',
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            min: 10,
        },
        {
            name: 'status',
            type: 'bool',
        },
    ],
}

const taskMediaCollectionData = {
    name: 'task_media',
    type: 'base',
    fields: [
        {
            name: 'tid',
            type: 'text',
            required: true,
        },
        {
            name: 'target_uid',
            type: 'text',
            required: true,
            max: 100
        },
        {
            name: 'action_type',
            type: 'text',
            required: true,
            max: 50
        },
        {
            name: 'camera',
            type: 'text',
            required: false,
            max: 20
        },
        {
            name: 'duration',
            type: 'number',
            required: false
        },
        {
            name: 'stream_type',
            type: 'text',
            required: false,
            max: 20
        },
        {
            name: 'stream_id',
            type: 'text',
            required: false,
            max: 100
        },
        {
            name: 'segment_seconds',
            type: 'number',
            required: false,
            default: 60
        },
        {
            name: 'is_used',
            type: 'bool',
            required: true
        },
        {
            name: 'file_url',
            type: 'text',
            required: false,
            max: 500
        },
        {
            name: 'status',
            type: 'text',
            required: true,
            max: 20
        }
    ],
    indexes: [
        'CREATE INDEX idx_task_media_tid ON task_media (tid)',
        'CREATE INDEX idx_task_media_target_uid ON task_media (target_uid)',
        'CREATE INDEX idx_task_media_action_type ON task_media (action_type)',
        'CREATE INDEX idx_task_media_status ON task_media (status)'
    ]
};

const taskLocationCollectionData = {
    name: 'task_location',
    type: 'base',
    fields: [
        {
            name: 'target_uid',
            type: 'text',
            required: true,
            max: 100
        },
        {
            name: 'lat',
            type: 'number',
            required: true
        },
        {
            name: 'lng',
            type: 'number',
            required: true
        },
        {
            name: 'address',
            type: 'text',
            required: false,
            max: 500
        },
        {
            name: 'coord_type',
            type: 'text',
            required: true,
            max: 20
        },
        {
            name: 'accuracy',
            type: 'number',
            required: false
        },
        {
            name: 'speed',
            type: 'number',
            required: false
        },
        {
            name: 'source',
            type: 'text',
            required: true,
            max: 20
        },
        {
            name: 'timestamp',
            type: 'number',
            required: true
        }
    ],
    indexes: [
        'CREATE INDEX idx_task_location_target_uid ON task_location (target_uid)',
        'CREATE INDEX idx_task_location_timestamp ON task_location (timestamp)',
        'CREATE INDEX idx_task_location_source ON task_location (source)'
    ]
};

const appUsageWeekCollectionData = {
    name: 'app_usage_week',
    type: 'base',
    fields: [
        {
            name: 'target_uid',
            type: 'text',
            required: true,
            max: 100
        },
        {
            name: 'week_label',
            type: 'text',
            required: true,
            max: 10
        },
        {
            name: 'package_name',
            type: 'text',
            required: true,
            max: 200
        },
        {
            name: 'app_name',
            type: 'text',
            required: true,
            max: 200
        },
        {
            name: 'payload',
            type: 'text',
            required: true
        },
        {
            name: 'is_used',
            type: 'bool',
            required: true
        }
    ],
    indexes: [
        'CREATE INDEX idx_app_usage_week_target_uid ON app_usage_week (target_uid)',
        'CREATE INDEX idx_app_usage_week_week_label ON app_usage_week (week_label)',
        'CREATE INDEX idx_app_usage_week_package_name ON app_usage_week (package_name)',
        'CREATE INDEX idx_app_usage_week_target_week ON app_usage_week (target_uid, week_label)'
    ]
};
const appUsageCollectionData = {
    name: 'app_usage',
    type: 'base',
    fields: [
        {
            name: 'target_uid',
            type: 'text',
            required: true,
            max: 100
        },
        {
            name: 'range',
            type: 'text',
            required: true,
            max: 20
        },
        {
            name: 'date',
            type: 'text',
            required: true,
            max: 10
        },
        {
            name: 'package_name',
            type: 'text',
            required: true,
            max: 200
        },
        {
            name: 'app_name',
            type: 'text',
            required: false,
            max: 200
        },
        {
            name: 'total_ms',
            type: 'number',
            required: true
        },
        {
            name: 'hourly_ms',
            type: 'json',
            required: false
        },
        {
            name: 'daily_ms',
            type: 'json',
            required: false
        },
        {
            name: 'is_used',
            type: 'bool',
            required: true
        }
    ],
    indexes: [
        'CREATE INDEX idx_app_usage_target_uid ON app_usage (target_uid)',
        'CREATE INDEX idx_app_usage_range_date ON app_usage (range, date)',
        'CREATE INDEX idx_app_usage_package_name ON app_usage (package_name)',
        'CREATE INDEX idx_app_usage_is_used ON app_usage (is_used)'
    ]
};

// 使用示例
// const pb = new PocketBase('http://127.0.0.1:8090');
//await createAllCollections(pb);
// 使用正确的方法调用
try {
  const taskCollection = await pb.collections.create(appUsageCollectionData);
  console.log("✅ tasks 集合创建成功:", taskCollection);
} catch (error) {
  console.error("❌ tasks 集合创建失败:", error);
  // 此时如果还有错误，error.response.data 可能会包含更具体的字段错误信息
}
