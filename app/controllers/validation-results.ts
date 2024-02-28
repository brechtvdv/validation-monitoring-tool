import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import type DocumentService from 'validation-monitoring-tool/services/document';
import {
  fetchDocument,
  getBlueprintOfDocumentType,
} from 'validation-monitoring-tool/services/queries';
import { validatePublication } from 'validation-monitoring-tool/services/validation';

export type RDFShape = {
  type: string;
  targetClass: string;
  properties: Array<RDFProperty>;
  amountOfProperties?: number;
  validAmountOfProperties?: number;
  closed?: boolean;
};

export type RDFProperty = {
  name: string;
  status?: string;
  description: string;
  path?: string;
  class?: string;
  datatype?: string;
  minCount?: number;
  maxCount?: number;
  valid?: boolean;
  amountFound?: number;
};

export default class ValidationResultsController extends Controller {
  @service declare document: DocumentService;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked validatedDocument: any = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    super(...args);
    this.validateDocument().then((resp) => {
      this.validatedDocument = resp;
    });
  }

  @action async validateDocument() {
    const blueprint = await getBlueprintOfDocumentType(
      this.document.documentType,
    );
    const document = await fetchDocument(this.document.documentURL);
    return await validatePublication(document, blueprint).then((result) => {
      return result;
    });
  }
}
