import os
import torch
import warnings
warnings.filterwarnings('ignore')
import pandas as pd
import torch.nn as nn
import torch.nn.functional as F
import pytorch_lightning as pl
from transformers import BertModel
from kobert_tokenizer import KoBERTTokenizer
from torch.utils.data import random_split, Dataset, DataLoader
from sklearn.metrics import precision_recall_fscore_support, accuracy_score
device = torch.device("cuda:0")

class BERTClassification(pl.LightningModule):

    # num_categories_per_class : [4,5,5]
    def __init__(self, num_categories_per_class):
        super(BERTClassification, self).__init__()
        self.num_classes = len(num_categories_per_class)
        self.num_categories_per_class = num_categories_per_class

        # load pretrained koBERT
        self.bert = BertModel.from_pretrained('skt/kobert-base-v1', output_attentions=True)

        # simple linear layer (긍/부정, 2 classes)
        #self.W = nn.Linear(self.bert.config.hidden_size, num_categories_per_class) # 768 -> 4
        self.W = nn.ModuleList([nn.Linear(self.bert.config.hidden_size, num_cat) for num_cat in num_categories_per_class])


    def forward(self, input_ids, attention_mask, token_type_ids):

        out = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids,
        )

        h_cls = out['last_hidden_state'][:, 0]
        #logits = self.W(h_cls)
        #attn = out['attentions']
        #return logits, attn

        logits_list = []
        for i in range(self.num_classes):
            logits = self.W[i](h_cls)
            logits_list.append(logits)
        return logits_list, out['attentions']




    def training_step(self, batch, batch_nb):
        # batch
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        token_type_ids = batch['token_type_ids']
        label_list = batch['label']

        # forward
        #y_hat_list: logits_list
        y_hat_list, attn = self.forward(input_ids, attention_mask, token_type_ids)

        # BCE loss
        #TODO: MODIFY labe.long() --> 각 카테고리에 맞춰서 레이블 대응시키기
        losses = []
        for idx, y_hat in enumerate(y_hat_list):
            loss = F.cross_entropy(y_hat, label_list[idx].long())
            losses.append(loss)

        # Average the losses
        loss = torch.stack(losses).mean()

        # logs
        tensorboard_logs = {'train_loss': loss}

        return {'loss': loss, 'log': tensorboard_logs}

    def validation_step(self, batch, batch_nb):
        # batch
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        token_type_ids = batch['token_type_ids']
        label_list = batch['label']

        # forward
        y_hat_list, attn = self.forward(input_ids, attention_mask, token_type_ids)

        # BCE loss
        losses = []
        accuracies = []
        for idx, y_hat in enumerate(y_hat_list):
          loss = F.cross_entropy(y_hat, label_list[idx].long())
          losses.append(loss)

          # accuracy
          _, y_pred = torch.max(y_hat, dim=1)
          acc = accuracy_score(y_pred.cpu(), label_list[idx].cpu())
          accuracies.append(acc)
          acc = torch.tensor(acc)
          self.log(f'val_acc_{idx}', acc, prog_bar=True)


        # Average the losses & accuracy
        loss = torch.stack(losses).mean()

        val_acc = torch.tensor(accuracies).mean()


        return {'val_loss': loss, 'val_acc': val_acc}


    def validation_end(self, outputs):
        avg_loss = torch.stack([x['val_loss'] for x in outputs]).mean()
        avg_val_acc = torch.stack([x['val_acc'] for x in outputs]).mean()

        tensorboard_logs = {'val_loss': avg_loss,'avg_val_acc':avg_val_acc}
        return {'avg_val_loss': avg_loss, 'progress_bar': tensorboard_logs}

    def test_step(self, batch, batch_nb):
        # batch
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        token_type_ids = batch['token_type_ids']
        label_list = batch['label']

        # forward
        y_hat_list, attn = self.forward(input_ids, attention_mask, token_type_ids)

        #accuracies
        accuracies = []
        for idx, y_hat in enumerate(y_hat_list):
          # accuracy
          _, y_pred = torch.max(y_hat, dim=1)
          acc = accuracy_score(y_pred.cpu(), label_list[idx].cpu())
          accuracies.append(acc)
          acc = torch.tensor(acc)
          self.log(f'test_acc_{idx}', acc, prog_bar=True)


        # Average the accuracy

        test_acc = torch.tensor(accuracies).mean()

        self.log_dict({'test_acc': test_acc})

        return {'test_acc': test_acc}

    def test_end(self, outputs):
        avg_test_acc = torch.stack([x['test_acc'] for x in outputs]).mean()

        tensorboard_logs = {'avg_test_acc': avg_test_acc}

        return {'avg_test_acc': tensorboard_logs}

    def configure_optimizers(self):
        parameters = []
        for p in self.parameters():
            if p.requires_grad:
                parameters.append(p)

        optimizer = torch.optim.Adam(parameters, lr=2e-05, eps=1e-08)

        return optimizer


