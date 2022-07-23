import { ethers } from 'ethers';
import { abi } from '../build/contracts/TodoList.json';

const { VITE_CONTRACT_ADDRESS } = import.meta.env;

class App {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadContract();
    await this.renderTasks();

    document.querySelector('button').addEventListener('click', (e) => this.createTask(e));
  }

  async loadContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts');
    const signer = provider.getSigner();
    this.contract = new ethers.Contract(VITE_CONTRACT_ADDRESS, abi, signer);
  }

  async renderTasks() {
    const tasks = await this.contract.getTasks();
    const ul = document.getElementById('list');
    ul.textContent = '';
    tasks.forEach((task) => {
      const [idx, content, completed] = task;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = idx;
      checkbox.checked = completed;
      checkbox.addEventListener('click', (e) => this.updateTask(e));
      const li = document.createElement('li');
      li.textContent = content;
      li.prepend(checkbox);
      ul.append(li);
    });
  }

  async createTask() {
    try {
      const content = document.getElementById('content');
      const res = await this.contract.createTask(content.value);
      await res.wait();
      await this.renderTasks();
      content.value = '';
    } catch (err) {
      alert(err.message);
    }
  }

  async updateTask(e) {
    try {
      const res = await this.contract.updateTask(e.target.name, e.target.checked);
      await res.wait();
    } catch (err) {
      alert(err.message);
      e.target.checked = !e.target.checked;
    }
  }
}

window.onload = () => new App();
