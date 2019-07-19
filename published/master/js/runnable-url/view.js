import { RunnableStorage } from './storage.js';
import { RunnableUrl, ValidPathTypes } from './index.js';

const runnableUrlInitialParams = RunnableUrl.reduceArrayToObject(
  HUGO_RUNNABLE_URL_INITIAL_PARAMS
);
const runnableUrlCurrentPathType = RunnableUrl.sanitizePathType(
  runnableUrlInitialParams.pathName
);
export const runnableUrlEndpointButton = $('#runnable-url-endpoint');
export const runnableUrl = RunnableUrl.load(
  runnableUrlInitialParams,
  runnableUrlCurrentPathType
);

export const InitRunnableUrlView = () => {
  const modalSelector = '#runnable-url-modal';
  const modal = $(modalSelector);
  const saveButton = $(`${modalSelector} button#save`);
  const defaultButton = $(`${modalSelector} button#load-defaults`);
  if (!modal) return;

  const loadAll = () => {
    ValidPathTypes.forEach(pathType => {
      const input = $(`${modalSelector} input[data-path-type="${pathType}"]`);

      // Load from storage using passed params and pathType.
      const runnableUrl = RunnableUrl.load(runnableUrlInitialParams, pathType);

      // Update endpoint button.
      updateEndpointButton(pathType, runnableUrl);

      // Set input value to current url.
      input.val(runnableUrl.url);

      // On enter keydown save changes and close modal.
      input.on('keydown', e => {
        if (e.which === 13) {
          saveAll();
          modal.modal('hide');
        }
      });
    });
  };

  const loadDefaults = () => {
    ValidPathTypes.forEach(pathType => {
      const input = $(`${modalSelector} input[data-path-type="${pathType}"]`);

      // Delete existing record from storage using passed params and pathType.
      RunnableUrl.load(runnableUrlInitialParams, pathType).delete(pathType);

      // Load from storage using passed params and pathType.
      const defaultRunnableUrl = RunnableUrl.load(
        runnableUrlInitialParams,
        pathType
      );

      // Reset current runnableUrl instance to default if matching.
      if (runnableUrlCurrentPathType === pathType) {
        runnableUrl.url = defaultRunnableUrl.url;
      }

      // Update endpoint button.
      updateEndpointButton(pathType, defaultRunnableUrl);

      // Set input value to current url.
      input.val(defaultRunnableUrl.url);
    });
  };

  const saveAll = () => {
    // Handle each path type.
    ValidPathTypes.forEach(pathType => {
      const input = $(`${modalSelector} input[data-path-type="${pathType}"]`);
      // Pass input value to url property, generate new RunnableUrl instance, and save.
      // Pass explicit pathType as override to ensure custom paths are
      // retained and associated with proper path type.
      RunnableUrl.factory({ url: input.val() }, { pathType }).save();

      if (pathType === runnableUrlCurrentPathType) {
        // Update runnableUrl.
        runnableUrl.url = input.val();
        // Update endpoint button.
        updateEndpointButton(pathType, runnableUrl);
      }
    });
  };

  const updateEndpointButton = (pathType, runnableUrl) => {
    if (pathType === runnableUrlCurrentPathType) {
      if (RUNNABLE_URL_CONFIG.displaycustomendpoint) {
        // Show custom endpoint.
        runnableUrlEndpointButton.text(runnableUrl.pathName);
      } else {
        // Show default endpoint.
        runnableUrlEndpointButton.text(`/${runnableUrlCurrentPathType}`);
      }
    }
  };

  // Load from storage.
  loadAll();

  // Save to storage on save click.
  saveButton.on('click', saveAll);

  // Reset all default values.
  defaultButton.on('click', loadDefaults);
};

/*
 * Blink button three times to highlight to user.
 */
runnableUrlEndpointButton.blink = config => {
  // Set defaults.
  config = config
    ? config
    : {
        colors: {
          base: {
            background: runnableUrlEndpointButton.css('background-color'),
            border: runnableUrlEndpointButton.css('border-color')
          },
          highlight: {
            background: '#fc3f0c',
            border: '#000'
          }
        },
        duration: 400
      };
  // Perform animations.
  runnableUrlEndpointButton
    .animate(
      {
        'background-color': config.colors.highlight.background,
        'border-color': config.colors.highlight.border
      },
      {
        duration: config.duration
      }
    )
    .animate(
      {
        'background-color': config.colors.base.background,
        'border-color': config.colors.base.border
      },
      {
        duration: config.duration
      }
    )
    .animate(
      {
        'background-color': config.colors.highlight.background,
        'border-color': config.colors.highlight.border
      },
      {
        duration: config.duration
      }
    )
    .animate(
      {
        'background-color': config.colors.base.background,
        'border-color': config.colors.base.border
      },
      {
        duration: config.duration
      }
    )
    .animate(
      {
        'background-color': config.colors.highlight.background,
        'border-color': config.colors.highlight.border
      },
      {
        duration: config.duration
      }
    )
    .animate(
      {
        'background-color': config.colors.base.background,
        'border-color': config.colors.base.border
      },
      {
        duration: config.duration
      }
    )
    .animate(
      {
        'background-color': config.colors.highlight.background,
        'border-color': config.colors.highlight.border
      },
      {
        duration: config.duration
      }
    )
    .animate(
      {
        'background-color': config.colors.base.background,
        'border-color': config.colors.base.border
      },
      {
        duration: config.duration,
        // Reset altered CSS properties after final animation.
        always: () => {
          runnableUrlEndpointButton.css('background-color', '');
          runnableUrlEndpointButton.css('border-color', '');
        }
      }
    );
};
