import YAML from 'js-yaml';

/**
 * 异步获取并解析用户选择的 YAML 文件。
 * @param {HTMLInputElement} fileInput - 文件输入元素。
 * @returns {Promise<object>} 返回解析后的 YAML 对象。
 */
export function parseYamlFileFromInput(fileInput) {
  return new Promise((resolve, reject) => {
    if (fileInput.type !== 'file') {
      reject(new Error('提供的元素不是文件输入类型。'));
      return;
    }

    fileInput.addEventListener('change', function handleChange(e) {
      fileInput.removeEventListener('change', handleChange);

      if (!fileInput.files || fileInput.files.length === 0) {
        reject(new Error('没有选择文件。'));
        return;
      }

      const file = fileInput.files[0];
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('文件大小不能超过 5 MiB。'));
        return;
      }

      const reader = new FileReader();

      reader.onload = event => {
        try {
          const data = YAML.load(event.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('文件解析失败: ' + error.message));
        } finally {
          e.target.value = '';
        }
      };

      reader.onerror = () => {
        e.target.value = '';
        reject(new Error('文件读取失败。'));
      };

      reader.readAsText(file);
    });

    fileInput.click();
  });
}
