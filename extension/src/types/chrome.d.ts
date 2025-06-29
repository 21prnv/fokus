declare namespace chrome {
  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
      active?: boolean;
      windowId?: number;
    }

    function query(queryInfo: {
      active?: boolean;
      currentWindow?: boolean;
    }): Promise<Tab[]>;
    function reload(tabId: number): Promise<void>;
  }

  namespace storage {
    namespace local {
      function get(
        keys?: string | string[] | object
      ): Promise<{ [key: string]: any }>;
      function set(items: { [key: string]: any }): Promise<void>;
      function remove(keys: string | string[]): Promise<void>;
    }

    interface StorageChange {
      oldValue?: any;
      newValue?: any;
    }

    interface StorageChanges {
      [key: string]: StorageChange;
    }

    const onChanged: {
      addListener(
        callback: (changes: StorageChanges, namespace: string) => void
      ): void;
    };
  }

  namespace alarms {
    interface Alarm {
      name: string;
      scheduledTime: number;
    }

    function create(
      name: string,
      alarmInfo: { delayInMinutes?: number }
    ): Promise<void>;
    function clear(name?: string): Promise<boolean>;

    const onAlarm: {
      addListener(callback: (alarm: Alarm) => void): void;
    };
  }

  namespace notifications {
    interface NotificationOptions {
      type: "basic" | "image" | "list" | "progress";
      iconUrl?: string;
      title?: string;
      message?: string;
    }

    function create(options: NotificationOptions): Promise<string>;
    function create(
      notificationId: string,
      options: NotificationOptions
    ): Promise<string>;
  }

  namespace runtime {
    const onInstalled: {
      addListener(callback: () => void): void;
    };

    const onStartup: {
      addListener(callback: () => void): void;
    };
  }
}
