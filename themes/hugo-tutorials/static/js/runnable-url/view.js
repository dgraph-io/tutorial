import { RunnableStorage } from './storage.js';
import { RunnableUrl, ValidPathTypes } from './index.js';

const runnableUrlInitialParams = RunnableUrl.reduceArrayToObject(
  HUGO_RUNNABLE_URL_INITIAL_PARAMS
);
const runnableUrlCurrentPathType = RunnableUrl.sanitizePathType(
  runnableUrlInitialParams.pathName
);
export const runnableUrl = RunnableUrl.load(
  runnableUrlInitialParams,
  runnableUrlCurrentPathType
);

export const InitRunnableUrlView = () => {
  const modalSelector = '#runnable-url-modal';
  const modal = $(modalSelector);
  const saveButton = $(`${modalSelector} button#save`);
  if (!modal) return;

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
        updateEndpointButton(pathType);
      }
    });
  };

  const updateEndpointButton = pathType => {
    const endpointButton = $(`#runnable-url-endpoint`);
    if (pathType === runnableUrlCurrentPathType) {
      endpointButton.text(runnableUrl.pathName);
    }
  };

  const loadAll = () => {
    ValidPathTypes.forEach(pathType => {
      const input = $(`${modalSelector} input[data-path-type="${pathType}"]`);

      // Load from storage using passed params and pathType.
      const runnableUrl = RunnableUrl.load(runnableUrlInitialParams, pathType);

      // Update endpoint button.
      updateEndpointButton(pathType);

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

  // Load from storage.
  loadAll();

  // Save to storage on save click.
  saveButton.on('click', saveAll);
};
