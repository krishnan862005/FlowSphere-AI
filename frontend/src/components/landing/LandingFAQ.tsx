'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Do I need to code to use FlowSphere AI?',
    a: 'No! FlowSphere AI is designed for everyone. The visual node editor lets you build complex automations by dragging and connecting nodes. For advanced use cases, optional JavaScript/Python nodes are available.',
  },
  {
    q: 'How does the AI workflow generation work?',
    a: 'Describe your automation in plain English (e.g., "When a new customer signs up, send a welcome email and notify our Slack channel"). Our AI — powered by GPT-4o — generates a complete, ready-to-run workflow in seconds.',
  },
  {
    q: 'What integrations are supported?',
    a: 'FlowSphere AI supports 200+ integrations including Slack, Discord, Telegram, Gmail, Outlook, Notion, Airtable, Google Sheets, Drive, Dropbox, PostgreSQL, MySQL, MongoDB, OpenAI, Anthropic, Gemini, Stripe, GitHub, Jira, and many more.',
  },
  {
    q: 'How is workflow execution billed?',
    a: 'Executions are counted per workflow run. Each plan includes a monthly execution allowance. You can monitor usage from your dashboard and upgrade anytime. Unused executions don\'t roll over.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use AES-256 encryption for all stored credentials, TLS in transit, JWT authentication, role-based access control, and maintain detailed audit logs. Enterprise customers get additional compliance controls.',
  },
  {
    q: 'Can I deploy FlowSphere AI on-premise?',
    a: 'Yes, on-premise deployment is available on the Enterprise plan. We provide Docker Compose and Helm charts for Kubernetes deployments, along with dedicated onboarding support.',
  },
  {
    q: 'What happens if my workflow fails?',
    a: 'FlowSphere AI automatically retries failed workflows with exponential backoff (up to 3 attempts by default). You receive instant notifications via email, Slack, or SMS, and can review detailed error logs in the execution history.',
  },
  {
    q: 'Can I collaborate with my team?',
    a: 'Absolutely! Teams can work together in shared workspaces with role-based permissions (Admin, Member, Viewer). Professional and Enterprise plans include real-time collaborative editing.',
  },
];

function FAQItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/8"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left group"
      >
        <span className="text-base font-medium text-white group-hover:text-primary transition-colors duration-200">
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-4"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
      </motion.div>
    </motion.div>
  );
}

export function LandingFAQ() {
  return (
    <section id="faq" className="py-32 px-6">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            FAQ
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
          <p className="text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? {' '}
            <a href="mailto:support@flowsphere.ai" className="text-primary hover:underline">Contact our support team</a>.
          </p>
        </motion.div>

        <div className="glass rounded-2xl px-8 py-2">
          {FAQS.map((faq, i) => (
            <FAQItem key={faq.q} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
