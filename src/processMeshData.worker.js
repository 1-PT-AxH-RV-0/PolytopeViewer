import { processMeshData } from './offProcessor.js';
import { process4DMeshData } from './offProcessor4D.js';

self.addEventListener('message', event => {
  const { meshData, is4D } = event.data;

  let progress = 0;

  try {
    const func = is4D ? process4DMeshData : processMeshData;

    const result = func(meshData, (current, total) => {
      progress = (current / total) * 100;
      self.postMessage({ type: 'progress', data: progress });
    });

    self.postMessage({ type: 'complete', data: result });
  } catch (error) {
    self.postMessage({ type: 'error', data: error });
  }
});
