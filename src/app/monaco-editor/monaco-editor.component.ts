import {Component, EventEmitter, Output} from '@angular/core';

import {ErrorHandlerService} from '../shared/error-handler.service';
import {TabControlService} from '../shared/tab-control.service';
import {VirtualFsService} from '../virtual-fs.service';

interface EditorConfigurations {
  language: string;
}

interface TabState {
  editorConfig: EditorConfigurations;
  filename: string;
}

@Component({
  selector : 'app-monaco-editor',
  templateUrl : './monaco-editor.component.html',
  styleUrls : [ './monaco-editor.component.css' ]
})
export class MonacoEditorComponent {

  @Output() fileChange: EventEmitter<object> = new EventEmitter();

  currentTab: TabState|null = null;
  currentTabIndex: number;
  fileErrorMessages: any[] = [];
  tabs: TabState[] = [];

  private writeTimeout: any;

  constructor(public fsService: VirtualFsService,
              private tabControlService: TabControlService,
              private errorHandler: ErrorHandlerService) {
    tabControlService.tabCreated$.subscribe(this.createNewTab.bind(this));
    tabControlService.tabClosed$.subscribe(
        this.handleTabClose.bind(this, null));
    errorHandler.$errorsGenerated.subscribe(
        (errors: {[filename: string]: any}) => {
          for (const filename of Object.keys(errors)) {
            if (this.fsService.fileExists(filename)) {
              this.fileErrorMessages = errors[filename];
              this.tabControlService.createTab(filename);
              return;
            }
          }
        });
  }

  changeEvent(value: string) {
    // sometimes an Event gets passed - not sure why
    // TODO: fix this
    if (typeof value === 'object') {
      return;
    }
    if (this.currentTab) {
      this.fsService.writeFile(this.currentTab.filename, value, false, true);
    }
  }

  monacoInitialized(event: Event) { this.fsService.initialize(); }

  createNewTab(filename: string) {
    for (let i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].filename === filename) {
        this.currentTab = this.tabs[i];
        this.currentTabIndex = i;
        return;
      }
    }

    const split = filename.split('.');
    let language = '';
    switch (split[split.length - 1]) {
    case 'ts':
      language = 'typescript';
      break;
    case 'html':
      language = 'html';
      break;
    case 'js':
      language = 'javascript';
      break;
    case 'css':
      language = 'css';
      break;
    }
    this.tabs.push({editorConfig : {language : language}, filename : filename});
    this.currentTab = this.tabs[this.tabs.length - 1];
    this.currentTabIndex = this.tabs.length - 1;
  }

  handleTabChange(event: any) { this.currentTab = this.tabs[event.index]; }

  handleTabClose(event: Event, filename: string) {
    for (let i = 0; i < this.tabs.length; i++) {
      const curFname = this.tabs[i].filename;
      if (curFname === filename) {

        this.tabs.splice(i, 1);

        console.log(this.tabs);

        if (this.tabs.length === 0) {
          this.currentTab = null;
          console.log('set current tab to null!');
        } else if (this.currentTab && this.currentTab.filename === curFname) {
          this.currentTab = this.tabs[0];
        }

        return;
      }
    }
  }
}
