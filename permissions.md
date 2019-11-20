Code Deployment

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObjectAcl",
                "s3:GetObject",
                "s3:GetBucketAcl",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::odileeds-code-staging/*",
                "arn:aws:s3:::odileeds-code-staging"
            ]
        }
    ]
}
```

Infrastructure Management

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "iam:GetPolicyVersion",
                "iam:CreateGroup",
                "s3:PutBucketPublicAccessBlock",
                "iam:GetPolicy",
                "iam:DeleteGroup",
                "iam:DeletePolicy",
                "s3:CreateBucket",
                "iam:CreatePolicy",
                "iam:ListPolicyVersions",
                "iam:AttachGroupPolicy",
                "iam:DetachGroupPolicy",
                "iam:CreatePolicyVersion",
                "s3:DeleteBucket",
                "iam:DeletePolicyVersion"
            ],
            "Resource": [
                "arn:aws:iam::*:policy/*",
                "arn:aws:iam::*:group/*",
                "arn:aws:s3:::*"
            ]
        }
    ]
}
```