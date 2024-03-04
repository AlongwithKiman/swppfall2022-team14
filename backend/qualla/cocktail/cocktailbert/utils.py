import torch

def postprocess_model(model, text, tokenizer):
  inputs = tokenizer.batch_encode_plus([text])
  out = model(input_ids = torch.tensor(inputs['input_ids']),
              attention_mask = torch.tensor(inputs['attention_mask']), token_type_ids = torch.tensor(inputs['token_type_ids']))

  size, abv, color = [torch.argmax(logit).item() for logit in out[0]]

  label0 = {
  0: "none",
  1: "long",
  2: "short",
  3: "shot"
}

  label1 = {
    0: "none",
    1: "0~15",
    2: "15~30",
    3: "30~40",
    4: "40~"
  }

  label2 = {
    0: "none",
    1: "red",
    2: "green",
    3: "blue",
    4: "brown",
    5: "yellow"
  }

  #return {"size":label0[size], "abv":label1[abv], "color":label2[color]}
  return {"size":size, "abv":abv, "color":color}